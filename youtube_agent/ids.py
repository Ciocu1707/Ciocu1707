"""Parse YouTube video IDs out of the many URL shapes people paste."""

from __future__ import annotations

import re
from urllib.parse import parse_qs, urlparse

_ID_RE = re.compile(r"^[A-Za-z0-9_-]{11}$")


def extract_video_id(value: str) -> str:
    """Return the 11-character video ID from a URL or bare ID.

    Handles watch?v=, youtu.be/, /shorts/, /embed/, /live/, /v/ and
    music.youtube.com links. Raises ValueError if no ID can be found.
    """
    value = value.strip()
    if _ID_RE.match(value):
        return value

    if "://" not in value:
        value = "https://" + value
    parsed = urlparse(value)
    host = (parsed.hostname or "").lower()

    if host.endswith("youtu.be"):
        candidate = parsed.path.lstrip("/").split("/")[0]
        if _ID_RE.match(candidate):
            return candidate

    if "youtube" in host:
        v = parse_qs(parsed.query).get("v")
        if v and _ID_RE.match(v[0]):
            return v[0]
        parts = [p for p in parsed.path.split("/") if p]
        if len(parts) >= 2 and parts[0] in {"shorts", "embed", "live", "v", "e"}:
            if _ID_RE.match(parts[1]):
                return parts[1]

    raise ValueError(f"Could not find a YouTube video ID in {value!r}")
