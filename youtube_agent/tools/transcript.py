"""Transcript tool: fetch a video's captions with timestamps (no API key needed)."""

from __future__ import annotations

import requests
from anthropic import beta_tool
from youtube_transcript_api import YouTubeTranscriptApi, YouTubeTranscriptApiException

from ..ids import extract_video_id


def format_timestamp(seconds: float) -> str:
    total = int(seconds)
    h, rem = divmod(total, 3600)
    m, s = divmod(rem, 60)
    return f"{h}:{m:02d}:{s:02d}" if h else f"{m}:{s:02d}"


@beta_tool
def get_transcript(video: str, languages: str = "en") -> str:
    """Fetch the full transcript (captions) of a YouTube video, with [m:ss] timestamps.

    Use this to summarize a video, answer questions about what is said in it,
    pull quotes, or build chapters. Works without an API key, but only for
    videos that have captions (manual or auto-generated).

    Args:
        video: A YouTube URL (watch, youtu.be, shorts, embed, live) or an 11-character video ID.
        languages: Comma-separated language codes in order of preference, e.g. "en" or "es,en".
    """
    try:
        video_id = extract_video_id(video)
    except ValueError as e:
        return f"Error: {e}"

    langs = [code.strip() for code in languages.split(",") if code.strip()] or ["en"]
    try:
        return _fetch(video_id, langs)
    except requests.RequestException as e:
        return f"Error: network problem reaching YouTube: {e.__class__.__name__}"


def _fetch(video_id: str, langs: list[str]) -> str:
    api = YouTubeTranscriptApi()
    try:
        fetched = api.fetch(video_id, languages=langs)
    except YouTubeTranscriptApiException as e:
        # Fall back to whatever transcript exists, translated if possible.
        try:
            transcripts = list(api.list(video_id))
        except YouTubeTranscriptApiException:
            return f"Error: no transcript available for {video_id}: {e.__class__.__name__}"
        if not transcripts:
            return f"Error: no transcript available for {video_id}."
        available = ", ".join(f"{t.language_code} ({t.language})" for t in transcripts)
        first = transcripts[0]
        try:
            if first.is_translatable and langs[0] in {
                t.language_code for t in first.translation_languages
            }:
                fetched = first.translate(langs[0]).fetch()
            else:
                fetched = first.fetch()
        except YouTubeTranscriptApiException as e2:
            return f"Error fetching transcript for {video_id}: {e2.__class__.__name__}. Available: {available}"

    lines = [f"[{format_timestamp(s.start)}] {s.text}" for s in fetched.snippets]
    header = (
        f"Transcript for https://www.youtube.com/watch?v={video_id} "
        f"(language: {fetched.language_code}, auto-generated: {fetched.is_generated}, "
        f"{len(lines)} segments)\n"
    )
    return header + "\n".join(lines)
