"""Read-only YouTube Data API v3 tools: search, video details, channels, comments.

All of these need YOUTUBE_API_KEY (a plain API key from Google Cloud Console
with "YouTube Data API v3" enabled). Each call returns compact JSON text.
"""

from __future__ import annotations

import json
import os
from functools import lru_cache
from typing import Any

from anthropic import beta_tool
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

from ..ids import extract_video_id


class MissingApiKey(RuntimeError):
    pass


@lru_cache(maxsize=1)
def _client():
    key = os.environ.get("YOUTUBE_API_KEY")
    if not key:
        raise MissingApiKey(
            "YOUTUBE_API_KEY is not set. Create an API key in Google Cloud Console with the "
            "YouTube Data API v3 enabled, then export YOUTUBE_API_KEY=..."
        )
    return build("youtube", "v3", developerKey=key, cache_discovery=False)


def _run(fn) -> str:
    """Run a Data API call and turn failures into a readable tool result."""
    try:
        return json.dumps(fn(), ensure_ascii=False, indent=1)
    except MissingApiKey as e:
        return f"Error: {e}"
    except HttpError as e:
        return f"Error: YouTube Data API returned HTTP {e.status_code}: {e.reason}"
    except ValueError as e:
        return f"Error: {e}"
    except OSError as e:
        return f"Error: network problem reaching the YouTube Data API: {e}"


def _video_summary(item: dict[str, Any]) -> dict[str, Any]:
    sn = item.get("snippet", {})
    st = item.get("statistics", {})
    cd = item.get("contentDetails", {})
    return {
        "id": item["id"],
        "url": f"https://www.youtube.com/watch?v={item['id']}",
        "title": sn.get("title"),
        "channel": sn.get("channelTitle"),
        "channel_id": sn.get("channelId"),
        "published_at": sn.get("publishedAt"),
        "duration": cd.get("duration"),
        "views": st.get("viewCount"),
        "likes": st.get("likeCount"),
        "comments": st.get("commentCount"),
        "tags": sn.get("tags", []),
        "category_id": sn.get("categoryId"),
        "description": sn.get("description"),
    }


def _videos_by_ids(ids: list[str]) -> list[dict[str, Any]]:
    if not ids:
        return []
    resp = (
        _client()
        .videos()
        .list(part="snippet,statistics,contentDetails", id=",".join(ids), maxResults=50)
        .execute()
    )
    return [_video_summary(i) for i in resp.get("items", [])]


@beta_tool
def get_video_details(video: str) -> str:
    """Get a video's title, description, tags, duration, publish date, and view/like/comment counts.

    Args:
        video: A YouTube URL or 11-character video ID.
    """

    def call():
        items = _videos_by_ids([extract_video_id(video)])
        if not items:
            raise ValueError("Video not found (it may be private or deleted).")
        return items[0]

    return _run(call)


@beta_tool
def search_videos(
    query: str,
    max_results: int = 10,
    order: str = "relevance",
    published_after: str = "",
    channel_id: str = "",
) -> str:
    """Search YouTube for videos and return each one with its stats.

    Use for topic research, finding competitors, spotting what performs well in a niche.

    Args:
        query: Search terms.
        max_results: Number of videos to return, 1-50.
        order: One of relevance, date, viewCount, rating.
        published_after: Optional RFC 3339 timestamp, e.g. 2026-01-01T00:00:00Z.
        channel_id: Optional channel ID to restrict the search to one channel.
    """

    def call():
        params: dict[str, Any] = {
            "part": "id",
            "q": query,
            "type": "video",
            "maxResults": max(1, min(int(max_results), 50)),
            "order": order,
        }
        if published_after:
            params["publishedAfter"] = published_after
        if channel_id:
            params["channelId"] = channel_id
        resp = _client().search().list(**params).execute()
        ids = [i["id"]["videoId"] for i in resp.get("items", []) if "videoId" in i.get("id", {})]
        videos = _videos_by_ids(ids)
        # Descriptions make search results bulky; trim them for overview purposes.
        for v in videos:
            v["description"] = (v["description"] or "")[:300]
        return videos

    return _run(call)


def _resolve_channel(channel: str) -> dict[str, Any]:
    channel = channel.strip()
    yt = _client().channels()
    part = "snippet,statistics,contentDetails,brandingSettings"
    if "youtube.com/" in channel:
        tail = channel.split("youtube.com/", 1)[1].split("?")[0].strip("/")
        if tail.startswith("channel/"):
            channel = tail.split("/")[1]
        else:
            channel = tail.split("/")[0]
    if channel.startswith("UC") and len(channel) == 24:
        resp = yt.list(part=part, id=channel).execute()
    else:
        handle = channel if channel.startswith("@") else "@" + channel
        resp = yt.list(part=part, forHandle=handle).execute()
    items = resp.get("items", [])
    if not items:
        raise ValueError(f"Channel {channel!r} not found.")
    return items[0]


@beta_tool
def get_channel(channel: str) -> str:
    """Get a channel's profile and stats: subscribers, total views, video count, description, keywords.

    Args:
        channel: A channel ID (UC...), an @handle, or a channel URL.
    """

    def call():
        c = _resolve_channel(channel)
        sn, st = c.get("snippet", {}), c.get("statistics", {})
        return {
            "id": c["id"],
            "title": sn.get("title"),
            "handle": sn.get("customUrl"),
            "created_at": sn.get("publishedAt"),
            "country": sn.get("country"),
            "subscribers": st.get("subscriberCount"),
            "total_views": st.get("viewCount"),
            "video_count": st.get("videoCount"),
            "keywords": c.get("brandingSettings", {}).get("channel", {}).get("keywords"),
            "description": sn.get("description"),
            "uploads_playlist_id": c.get("contentDetails", {})
            .get("relatedPlaylists", {})
            .get("uploads"),
        }

    return _run(call)


@beta_tool
def list_channel_videos(channel: str, max_results: int = 20) -> str:
    """List a channel's most recent uploads with stats, newest first.

    Use to analyze a channel's recent performance, posting cadence, and title patterns.

    Args:
        channel: A channel ID (UC...), an @handle, or a channel URL.
        max_results: Number of recent videos, 1-50.
    """

    def call():
        c = _resolve_channel(channel)
        uploads = c["contentDetails"]["relatedPlaylists"]["uploads"]
        resp = (
            _client()
            .playlistItems()
            .list(
                part="contentDetails",
                playlistId=uploads,
                maxResults=max(1, min(int(max_results), 50)),
            )
            .execute()
        )
        ids = [i["contentDetails"]["videoId"] for i in resp.get("items", [])]
        videos = _videos_by_ids(ids)
        for v in videos:
            v["description"] = (v["description"] or "")[:300]
        return videos

    return _run(call)


@beta_tool
def get_comments(video: str, max_results: int = 50, order: str = "relevance") -> str:
    """Get top-level comments on a video (author, text, likes, reply count).

    Use to gauge audience reaction, find questions viewers ask, or mine ideas for new videos.

    Args:
        video: A YouTube URL or 11-character video ID.
        max_results: Number of comment threads, 1-100.
        order: relevance or time.
    """

    def call():
        resp = (
            _client()
            .commentThreads()
            .list(
                part="snippet",
                videoId=extract_video_id(video),
                maxResults=max(1, min(int(max_results), 100)),
                order=order,
                textFormat="plainText",
            )
            .execute()
        )
        out = []
        for t in resp.get("items", []):
            top = t["snippet"]["topLevelComment"]["snippet"]
            out.append(
                {
                    "author": top.get("authorDisplayName"),
                    "text": top.get("textDisplay"),
                    "likes": top.get("likeCount"),
                    "replies": t["snippet"].get("totalReplyCount"),
                    "published_at": top.get("publishedAt"),
                }
            )
        return out

    return _run(call)
