#!/bin/sh
# Joins the three parts of "Tata și parola" into one film: picture copied, audio re-mastered to -14 LUFS, subtitles shifted.
set -e
HERE=$(cd "$(dirname "$0")" && pwd); ROOT=$(dirname "$HERE"); T=$(mktemp -d)
printf "file '%s'\nfile '%s'\nfile '%s'\n" "$ROOT/parola/parola-partea1.mp4" "$ROOT/parola2/parola-partea2.mp4" "$ROOT/parola3/parola-partea3.mp4" > "$T/list.txt"
ffmpeg -hide_banner -loglevel error -y -f concat -safe 0 -i "$T/list.txt" -c copy "$T/joined.mp4"
ffmpeg -hide_banner -loglevel error -y -i "$T/joined.mp4" -vn -c:a pcm_s16le -ar 48000 "$T/joined.wav"
sh "$ROOT/parola/tools/master_ff6.sh" "$T/joined.mp4" "$T/joined.wav" "$T/mastered.mp4"
# re-encode so the file stays under 100 MB (GitHub limit)
ffmpeg -hide_banner -loglevel error -y -i "$T/mastered.mp4" -c:v libx264 -crf 21 -preset medium -pix_fmt yuv420p -c:a copy -movflags +faststart "$HERE/tata-si-parola.mp4"
# subtitles: part 2 starts at the end of part 1, part 3 at the end of part 2
python3 - "$ROOT" "$HERE/tata-si-parola.srt" <<'PY'
import sys, re, subprocess
root, out = sys.argv[1], sys.argv[2]
dur = lambda f: float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]))
parts = [(root + '/parola/parola-partea1.srt', root + '/parola/parola-partea1.mp4'), (root + '/parola2/parola-partea2.srt', root + '/parola2/parola-partea2.mp4'), (root + '/parola3/parola-partea3.srt', root + '/parola3/parola-partea3.mp4')]
def ts(s): h, m, rest = s.split(':'); sec, ms = rest.split(','); return int(h) * 3600 + int(m) * 60 + int(sec) + int(ms) / 1000
def fmt(x): ms = round(x * 1000); return f"{ms // 3600000:02d}:{ms // 60000 % 60:02d}:{ms // 1000 % 60:02d},{ms % 1000:03d}"
off, n, lines = 0.0, 0, []
for srt, mp4 in parts:
    for block in open(srt, encoding='utf-8').read().strip().split('\n\n'):
        b = block.split('\n'); a, c = b[1].split(' --> '); n += 1
        lines.append(f"{n}\n{fmt(ts(a) + off)} --> {fmt(ts(c) + off)}\n" + '\n'.join(b[2:]) + '\n')
    off += dur(mp4)
open(out, 'w', encoding='utf-8').write('\n'.join(lines))
print('srt', n, 'cues, total', round(off, 1), 's')
PY
rm -rf "$T"
