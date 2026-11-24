from types import SimpleNamespace

import pytest

from youtube_agent.agent import YouTubeAgent
from youtube_agent.ids import extract_video_id
from youtube_agent.tools import ALL_TOOLS, READ_TOOLS, publish
from youtube_agent.tools.transcript import format_timestamp

VID = "dQw4w9WgXcQ"


@pytest.mark.parametrize(
    "value",
    [
        VID,
        f"https://www.youtube.com/watch?v={VID}",
        f"https://www.youtube.com/watch?feature=share&v={VID}&t=42s",
        f"youtube.com/watch?v={VID}",
        f"https://youtu.be/{VID}?si=abc",
        f"https://www.youtube.com/shorts/{VID}",
        f"https://www.youtube.com/embed/{VID}",
        f"https://www.youtube.com/live/{VID}?feature=share",
        f"https://m.youtube.com/watch?v={VID}",
        f"https://music.youtube.com/watch?v={VID}&list=x",
    ],
)
def test_extract_video_id(value):
    assert extract_video_id(value) == VID


@pytest.mark.parametrize("value", ["", "hello", "https://example.com/watch?v=" + VID, "https://youtube.com/@chan"])
def test_extract_video_id_rejects(value):
    with pytest.raises(ValueError):
        extract_video_id(value)


def test_format_timestamp():
    assert format_timestamp(0) == "0:00"
    assert format_timestamp(65.7) == "1:05"
    assert format_timestamp(3725) == "1:02:05"


def test_tool_schemas_are_generated():
    names = set()
    for tool in ALL_TOOLS:
        param = tool.to_dict()
        names.add(param["name"])
        assert param["description"]
        assert param["input_schema"]["type"] == "object"
    assert {"get_transcript", "search_videos", "upload_video"} <= names
    assert "upload_video" not in {t.to_dict()["name"] for t in READ_TOOLS}


def test_write_tools_respect_declined_confirmation(tmp_path, monkeypatch):
    video = tmp_path / "v.mp4"
    video.write_bytes(b"0" * 10)
    monkeypatch.setattr(publish, "confirm", lambda summary: False)
    called = []
    monkeypatch.setattr(publish, "_oauth_client", lambda: called.append(1))
    out = publish.upload_video.call({"file_path": str(video), "title": "t"})
    assert "declined" in out
    assert not called


def test_upload_validates_privacy(tmp_path):
    video = tmp_path / "v.mp4"
    video.write_bytes(b"0")
    out = publish.upload_video.call({"file_path": str(video), "title": "t", "privacy_status": "secret"})
    assert out.startswith("Error")


class _FakeMessage(SimpleNamespace):
    def to_param(self):
        return {"role": "assistant", "content": [{"type": b.type} for b in self.content]}


class _FakeRunner:
    def __init__(self, messages, tool_responses):
        self._messages = messages
        self._responses = tool_responses

    def __iter__(self):
        return iter(self._messages)

    def generate_tool_call_response(self):
        return self._responses.pop(0)


def test_agent_keeps_append_only_history():
    tool_turn = _FakeMessage(
        content=[SimpleNamespace(type="tool_use", name="get_transcript", input={"video": VID})],
        stop_reason="tool_use",
    )
    final_turn = _FakeMessage(content=[SimpleNamespace(type="text", text="Summary")], stop_reason="end_turn")
    tool_result = {"role": "user", "content": [{"type": "tool_result", "tool_use_id": "x", "content": "..."}]}
    captured = {}

    def tool_runner(**kwargs):
        captured.update(kwargs)
        return _FakeRunner([tool_turn, final_turn], [tool_result, None])

    client = SimpleNamespace(beta=SimpleNamespace(messages=SimpleNamespace(tool_runner=tool_runner)))
    agent = YouTubeAgent(client=client)
    texts, tools = [], []
    final = agent.ask("summarize", on_text=texts.append, on_tool=lambda n, a: tools.append(n))

    assert final is final_turn
    assert texts == ["Summary"]
    assert tools == ["get_transcript"]
    assert [m["role"] for m in agent.history] == ["user", "assistant", "user", "assistant"]
    assert captured["model"] == "claude-opus-5-5"
    assert captured["fallbacks"] == "default"
    assert captured["messages"] == [{"role": "user", "content": "summarize"}]
