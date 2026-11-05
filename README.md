# YouTube Agent

A command-line agent, powered by Claude (`claude-opus-5-5`), that works with YouTube. It can:

| Area | What it does | Needs |
|---|---|---|
| **Video Q&A & summaries** | Fetches a video's transcript and summarizes it, answers questions, pulls quotes, and lists key moments with timestamp links | nothing extra |
| **Creator content help** | Titles, descriptions, tags, chapters, hooks, Shorts ideas, and scripts, based on the real video content | nothing extra (research tools improve it) |
| **Channel & topic research** | Search, channel stats, recent uploads, and comment mining | `YOUTUBE_API_KEY` |
| **Publishing** | Uploads videos (private by default), edits title/description/tags/privacy, and sets thumbnails, **always asking you first** | OAuth client secret |

## Setup

```bash
pip install -e .            # or: pip install -e '.[dev]' to run tests
cp .env.example .env        # fill in, then: set -a; source .env; set +a
```

- **Claude:** set `ANTHROPIC_API_KEY`, or run `ant auth login`.
- **YouTube Data API key** (research tools): in Google Cloud Console, enable *YouTube Data API v3*, create an API key, and set `YOUTUBE_API_KEY`.
- **OAuth** (publishing only): create an OAuth client of type *Desktop app*, download the JSON, and point `YOUTUBE_CLIENT_SECRETS` at it. The first write opens a browser to log in. The token is cached at `YOUTUBE_TOKEN_FILE` (default `~/.youtube_agent/token.json`, mode 600).

## Usage

```bash
# one-shot
youtube-agent "Summarize https://youtu.be/VIDEO_ID with timestamps"

# interactive chat (history is kept; /reset clears it, /quit exits)
youtube-agent
you> https://www.youtube.com/watch?v=VIDEO_ID  what are the 3 main arguments?
you> write 5 title options and chapters for it
you> compare @somechannel's last 20 uploads: which topics outperform?
you> upload ~/videos/ep12.mp4 with the title and description you wrote
```

Options: `--read-only` (no write tools at all), `--yes` (skip confirmation prompts; be careful), `--effort low|medium|high|xhigh|max` (default `high`), `--model`, `--quiet`.

## How it works

- `youtube_agent/agent.py`: the conversation loop. It uses the Anthropic SDK tool runner (`client.beta.messages.tool_runner`) with adaptive thinking, an explicit effort level, prompt caching, and server-side refusal fallbacks (`fallbacks: "default"`). History is append-only, so cached prefixes and thinking blocks stay valid across turns.
- `youtube_agent/tools/transcript.py`: `get_transcript` (via `youtube-transcript-api`, which needs no key).
- `youtube_agent/tools/data_api.py`: `get_video_details`, `search_videos`, `get_channel`, `list_channel_videos`, `get_comments`.
- `youtube_agent/tools/publish.py`: `upload_video`, `update_video_metadata`, `set_thumbnail`. Each one shows a summary and waits for `y` before it acts.

## Notes

- Transcripts exist only for videos with captions. YouTube may block transcript scraping from cloud/datacenter IPs, so run the agent from your own machine.
- Data API quota: a search costs 100 units and most other calls cost 1 (the default is 10,000 per day). Uploads cost about 1,600 units.
- Videos uploaded through an unverified Google Cloud project may be locked to private until the project passes YouTube's API audit.

## Tests

```bash
pytest
```
