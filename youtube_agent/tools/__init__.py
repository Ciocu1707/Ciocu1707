from .data_api import get_channel, get_comments, get_video_details, list_channel_videos, search_videos
from .publish import set_thumbnail, update_video_metadata, upload_video
from .transcript import get_transcript

READ_TOOLS = [
    get_transcript,
    get_video_details,
    search_videos,
    get_channel,
    list_channel_videos,
    get_comments,
]
WRITE_TOOLS = [upload_video, update_video_metadata, set_thumbnail]
ALL_TOOLS = READ_TOOLS + WRITE_TOOLS
