#!/usr/bin/env bash
# Normalise le son des vidéos rendues à -14 LUFS (standard des réseaux sociaux), sans réencoder l'image.
# Usage : bash scripts/master-audio.sh out/douminidouman-presentation.mp4 [autres.mp4…]
set -euo pipefail
for f in "$@"; do
  stats=$(ffmpeg -hide_banner -i "$f" -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/{/,/}/p')
  args=$(echo "$stats" | python3 -c "import json,sys;d=json.load(sys.stdin);print(f\"measured_I={d['input_i']}:measured_TP={d['input_tp']}:measured_LRA={d['input_lra']}:measured_thresh={d['input_thresh']}:offset={d['target_offset']}\")")
  ffmpeg -v error -y -i "$f" -c:v copy -af "loudnorm=I=-14:TP=-1.5:LRA=11:$args:linear=true" -ar 48000 -c:a aac -b:a 192k -movflags +faststart "${f%.mp4}.tmp.mp4"
  mv "${f%.mp4}.tmp.mp4" "$f"
  echo "ok $f"
done
