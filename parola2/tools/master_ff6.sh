#!/bin/sh
# Master with ffmpeg 6 (core/render/mux.sh needs 7): two-pass loudnorm to -14 LUFS / -1.5 dBTP on the WAV alone,
# then mux with the picture copied. Usage: sh tools/master_ff6.sh video.mp4 mix.wav out.mp4
set -e
V=$1; A=$2; O=$3; T=$(mktemp -d)
J=$(ffmpeg -hide_banner -nostats -i "$A" -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/{/,/}/p')
g() { echo "$J" | grep "\"$1\"" | sed 's/.*: "\(.*\)".*/\1/'; }
ffmpeg -hide_banner -loglevel error -y -i "$A" -af "loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=$(g input_i):measured_TP=$(g input_tp):measured_LRA=$(g input_lra):measured_thresh=$(g input_thresh):offset=$(g target_offset):linear=true,aresample=48000" -c:a pcm_s16le "$T/norm.wav"
ffmpeg -hide_banner -loglevel error -y -i "$V" -i "$T/norm.wav" -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -shortest -movflags +faststart "$O"
rm -rf "$T"
