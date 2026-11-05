"""Write tools that act on the user's own channel: upload, update metadata, set thumbnail.

These use OAuth (YOUTUBE_CLIENT_SECRETS, a Desktop-app client secret JSON).
Every write asks the human for confirmation in the terminal before it runs,
unless the agent was started with --yes. Uploads default to private.
"""

from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Callable

from anthropic import beta_tool
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from googleapiclient.http import MediaFileUpload

from ..ids import extract_video_id

SCOPES = ["https://www.googleapis.com/auth/youtube"]
PRIVACY = {"private", "unlisted", "public"}

# Replaced by the CLI. Returns True if the human approves the action.
confirm: Callable[[str], bool] = lambda summary: False  # noqa: E731


def _oauth_client():
    from google.auth.transport.requests import Request
    from google.oauth2.credentials import Credentials
    from google_auth_oauthlib.flow import InstalledAppFlow

    secrets = os.environ.get("YOUTUBE_CLIENT_SECRETS", "client_secret.json")
    token_path = Path(
        os.path.expanduser(os.environ.get("YOUTUBE_TOKEN_FILE", "~/.youtube_agent/token.json"))
    )
    creds = None
    if token_path.exists():
        creds = Credentials.from_authorized_user_file(str(token_path), SCOPES)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            if not Path(secrets).exists():
                raise FileNotFoundError(
                    f"OAuth client secrets not found at {secrets!r}. Create a Desktop-app OAuth "
                    "client in Google Cloud Console and set YOUTUBE_CLIENT_SECRETS to its JSON path."
                )
            flow = InstalledAppFlow.from_client_secrets_file(secrets, SCOPES)
            creds = flow.run_local_server(port=0)
        token_path.parent.mkdir(parents=True, exist_ok=True)
        token_path.write_text(creds.to_json())
        os.chmod(token_path, 0o600)
    return build("youtube", "v3", credentials=creds, cache_discovery=False)


def _split_tags(tags: str) -> list[str]:
    return [t.strip() for t in tags.split(",") if t.strip()]


def _guard(summary: str, action: Callable[[], dict]) -> str:
    if not confirm(summary):
        return "The user declined this action. Nothing was changed."
    try:
        return json.dumps(action(), ensure_ascii=False, indent=1)
    except HttpError as e:
        return f"Error: YouTube Data API returned HTTP {e.status_code}: {e.reason}"
    except (FileNotFoundError, ValueError) as e:
        return f"Error: {e}"
    except OSError as e:
        return f"Error: network problem reaching YouTube: {e}"


@beta_tool
def upload_video(
    file_path: str,
    title: str,
    description: str = "",
    tags: str = "",
    privacy_status: str = "private",
    category_id: str = "22",
    made_for_kids: bool = False,
) -> str:
    """Upload a local video file to the user's YouTube channel. Asks the user to confirm first.

    Uploads default to private so the user can review before publishing.

    Args:
        file_path: Path to the local video file.
        title: Video title (max 100 characters).
        description: Video description (max 5000 characters).
        tags: Comma-separated tags.
        privacy_status: private, unlisted, or public. Use public only if the user asked for it.
        category_id: YouTube category ID (22 = People & Blogs, 27 = Education, 28 = Science & Technology).
        made_for_kids: Whether the video is made for kids (COPPA declaration).
    """
    path = Path(os.path.expanduser(file_path))
    if privacy_status not in PRIVACY:
        return f"Error: privacy_status must be one of {sorted(PRIVACY)}."
    if not path.is_file():
        return f"Error: file not found: {path}"
    if len(title) > 100:
        return "Error: title is longer than 100 characters."

    summary = (
        f"UPLOAD {path} ({path.stat().st_size / 1e6:.1f} MB) as {privacy_status.upper()}\n"
        f"  title: {title}\n  tags: {tags or '-'}\n  description: {description[:200]!r}"
    )

    def action():
        yt = _oauth_client()
        body = {
            "snippet": {
                "title": title,
                "description": description,
                "tags": _split_tags(tags),
                "categoryId": category_id,
            },
            "status": {"privacyStatus": privacy_status, "selfDeclaredMadeForKids": made_for_kids},
        }
        media = MediaFileUpload(str(path), chunksize=8 * 1024 * 1024, resumable=True)
        request = yt.videos().insert(part="snippet,status", body=body, media_body=media)
        response = None
        while response is None:
            status, response = request.next_chunk()
            if status:
                print(f"  upload {int(status.progress() * 100)}%", flush=True)
        vid = response["id"]
        return {"video_id": vid, "url": f"https://www.youtube.com/watch?v={vid}", "privacy": privacy_status}

    return _guard(summary, action)


@beta_tool
def update_video_metadata(
    video: str,
    title: str = "",
    description: str = "",
    tags: str = "",
    privacy_status: str = "",
) -> str:
    """Update the title, description, tags, or privacy of one of the user's own videos. Asks to confirm first.

    Leave a field empty to keep its current value.

    Args:
        video: A YouTube URL or 11-character video ID owned by the authenticated user.
        title: New title, or empty to keep.
        description: New description, or empty to keep.
        tags: New comma-separated tags (replaces all existing tags), or empty to keep.
        privacy_status: private, unlisted, public, or empty to keep.
    """
    try:
        video_id = extract_video_id(video)
    except ValueError as e:
        return f"Error: {e}"
    if privacy_status and privacy_status not in PRIVACY:
        return f"Error: privacy_status must be one of {sorted(PRIVACY)}."
    if not any([title, description, tags, privacy_status]):
        return "Error: nothing to update."

    changes = [
        f"  {name}: {val[:200]!r}"
        for name, val in [("title", title), ("description", description), ("tags", tags), ("privacy", privacy_status)]
        if val
    ]
    summary = f"UPDATE video {video_id}\n" + "\n".join(changes)

    def action():
        yt = _oauth_client()
        resp = yt.videos().list(part="snippet,status", id=video_id).execute()
        if not resp.get("items"):
            raise ValueError("Video not found, or it is not owned by the authenticated account.")
        item = resp["items"][0]
        snippet = item["snippet"]
        # videos.update replaces the whole snippet, so send back the required fields.
        new_snippet = {
            "title": title or snippet["title"],
            "description": description if description else snippet.get("description", ""),
            "tags": _split_tags(tags) if tags else snippet.get("tags", []),
            "categoryId": snippet["categoryId"],
        }
        body: dict = {"id": video_id, "snippet": new_snippet}
        parts = ["snippet"]
        if privacy_status:
            status = item["status"]
            status["privacyStatus"] = privacy_status
            body["status"] = status
            parts.append("status")
        yt.videos().update(part=",".join(parts), body=body).execute()
        return {"video_id": video_id, "updated": [c.split(":")[0].strip() for c in changes]}

    return _guard(summary, action)


@beta_tool
def set_thumbnail(video: str, image_path: str) -> str:
    """Set a custom thumbnail (JPG/PNG, max 2 MB, ideally 1280x720) on one of the user's videos. Asks to confirm first.

    Args:
        video: A YouTube URL or 11-character video ID owned by the authenticated user.
        image_path: Path to the local thumbnail image.
    """
    try:
        video_id = extract_video_id(video)
    except ValueError as e:
        return f"Error: {e}"
    path = Path(os.path.expanduser(image_path))
    if not path.is_file():
        return f"Error: file not found: {path}"

    def action():
        yt = _oauth_client()
        yt.thumbnails().set(videoId=video_id, media_body=MediaFileUpload(str(path))).execute()
        return {"video_id": video_id, "thumbnail": str(path)}

    return _guard(f"SET THUMBNAIL of {video_id} to {path}", action)
