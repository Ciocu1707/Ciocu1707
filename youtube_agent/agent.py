"""The agent: a multi-turn conversation with Claude driving the YouTube tools."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Callable

import anthropic
from anthropic.types.beta import BetaMessage, BetaMessageParam

from .tools import ALL_TOOLS, READ_TOOLS

MODEL = "claude-opus-5-5"

SYSTEM_PROMPT = """\
You are a YouTube agent. You help people with four kinds of work:

1. Video Q&A and summaries. Given a video link, fetch its transcript and details, then
   summarize it, answer questions about it, pull quotes, or list key moments. Cite
   timestamps as [m:ss] and, when useful, as links of the form
   https://www.youtube.com/watch?v=ID&t=SECONDSs. Ground every claim about a video in its
   transcript or metadata; if the transcript is unavailable, say so rather than guessing.

2. Creator content help. Write titles, descriptions, tags, chapters (the first chapter must
   start at 0:00 and there must be at least three, each at least 10 seconds long), hooks,
   Shorts ideas, and scripts. Titles stay under 100 characters and should front-load the
   payoff; descriptions put the most important line first. Base suggestions on the actual
   video content when a video is given, and on real search/channel data when research would
   sharpen them.

3. Channel and topic research. Use search and channel tools to compare videos and channels:
   views relative to channel size, posting cadence, title and topic patterns, and what
   commenters ask for. Report numbers as the API returns them and say when a sample is small.

4. Publishing. Upload videos and edit metadata or thumbnails on the user's own channel.
   These tools ask the user to confirm in the terminal before acting. Upload as private
   unless the user explicitly asks for unlisted or public. Never claim an upload or edit
   succeeded unless the tool result says so.

If a tool reports a missing API key or credentials, tell the user exactly which environment
variable or file is needed and continue with whatever the other tools can still do.
Be concise; use short headings and bullet lists for summaries and research reports.
"""


@dataclass
class YouTubeAgent:
    """Holds the conversation history and runs one user turn at a time."""

    client: anthropic.Anthropic = field(default_factory=anthropic.Anthropic)
    model: str = MODEL
    effort: str = "high"
    allow_writes: bool = True
    history: list[BetaMessageParam] = field(default_factory=list)

    def ask(
        self,
        user_input: str,
        on_text: Callable[[str], None] = print,
        on_tool: Callable[[str, dict], None] | None = None,
    ) -> BetaMessage:
        """Send one user message, let Claude call tools until done, and return the final message."""
        self.history.append({"role": "user", "content": user_input})
        runner = self.client.beta.messages.tool_runner(
            model=self.model,
            max_tokens=16000,
            system=SYSTEM_PROMPT,
            tools=ALL_TOOLS if self.allow_writes else READ_TOOLS,
            messages=list(self.history),
            # Claude Opus 5.5 always thinks adaptively; effort is the depth control and
            # defaults to "medium" on this model, so set it explicitly.
            thinking={"type": "adaptive"},
            output_config={"effort": self.effort},
            # If a safety classifier declines a turn, let the API re-run it on a fallback model.
            betas=["server-side-fallback-2026-07-01"],
            fallbacks="default",
            # Cache the growing conversation prefix (system + tools + history) between turns.
            cache_control={"type": "ephemeral"},
            max_iterations=40,
        )

        final: BetaMessage | None = None
        for message in runner:
            final = message
            # Keep history append-only and pass blocks back unchanged (thinking blocks included).
            self.history.append(message.to_param())
            for block in message.content:
                if block.type == "text" and block.text.strip():
                    on_text(block.text)
                elif block.type == "tool_use" and on_tool:
                    on_tool(block.name, block.input)
            if message.stop_reason == "refusal":
                on_text("[The request was declined by the model's safety system.]")
                break
            tool_results = runner.generate_tool_call_response()
            if tool_results is not None:
                self.history.append(tool_results)

        assert final is not None
        return final

    def reset(self) -> None:
        self.history.clear()
