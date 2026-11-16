#!/bin/sh
# One-command build of "Tata și parola (partea 2)" (episode 5, part 2). Needs the Lemo-Opuscar library (LIB) with `setup.sh deps` done.
set -e
HERE=$(cd "$(dirname "$0")" && pwd)
LIB=${LIB:-/root/lemo-opuscar}
export LIB
[ -f "$LIB/core/render/video.mjs" ] || { echo "set LIB to the library folder"; exit 1; }
PY="$LIB/.venv/bin/python"
# voices (edge-tts, online; cached in out/raw/.cache) → processed voices + lip sync
"$PY" "$HERE/tools/tts_ro.py" "$HERE/lines.json" "$HERE/out/raw"
"$PY" "$HERE/voice.py"
cd "$LIB"
node core/render/events.mjs "$HERE"
"$PY" "$HERE/music/score.py"
"$PY" "$HERE/mix.py"
node core/render/video.mjs "$HERE" --fps 24 --workers 4 --out "$HERE/out/video.mp4"
node "$HERE/srt.mjs"
if [ "$(ffmpeg -version | sed -n '1s/^ffmpeg version n\{0,1\}\([0-9]*\).*/\1/p')" -ge 7 ]; then
  sh core/render/mux.sh "$HERE/out/video.mp4" "$HERE/out/mix.wav" "$HERE/parola-partea2.mp4" 24 0
else   # ffmpeg 6: master the WAV alone, then mux (tools/master_ff6.sh)
  sh "$HERE/tools/master_ff6.sh" "$HERE/out/video.mp4" "$HERE/out/mix.wav" "$HERE/parola-partea2.mp4"
fi
