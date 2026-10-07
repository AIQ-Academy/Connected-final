#!/usr/bin/env bash
#
# Builds the hero background renditions and poster from the camera master.
#
#   npm run hero:video
#
# To swap the footage: drop the new file at
# public/video/hero-skyscraper-source.mp4 and run the command above. Nothing
# else needs to change — src/lib/media.ts already points at the outputs this
# script writes. The master is deliberately gitignored; only the renditions
# below are committed.
#
# The loop is built as a ping-pong (forward, then reverse) because the camera
# move means the last frame is nowhere near the first one, so a straight loop
# would jump on every repeat. Reversing an aerial drift reads as a second slow
# move rather than as a rewind, and it removes the seam entirely.

set -euo pipefail

cd "$(dirname "$0")/.."

SOURCE=${SOURCE:-public/video/hero-skyscraper-source.mp4}
NAME=${NAME:-hero-skyscraper}
OUT_DIR=public/video
POSTER_DIR=public/hero

# Trim applied before everything else. Defaults cover the whole master.
TRIM_START=${TRIM_START:-0}
TRIM_DURATION=${TRIM_DURATION:-}

FPS=${FPS:-25}
CRF_1080=${CRF_1080:-28}
CRF_720=${CRF_720:-28}
CRF_640=${CRF_640:-29}
# VP9 sits on a different quality scale than x264; these land near the x264 CRFs
# above. Set WEBM=0 to skip the alternates when iterating.
VP9_1080=${VP9_1080:-36}
VP9_720=${VP9_720:-36}
VP9_640=${VP9_640:-37}
WEBM=${WEBM:-1}

if [[ ! -f $SOURCE ]]; then
  echo "hero-video: no master at $SOURCE" >&2
  echo "Drop the camera original there, then run this again." >&2
  exit 1
fi

if ! command -v ffmpeg >/dev/null; then
  echo "hero-video: ffmpeg is not installed (brew install ffmpeg)" >&2
  exit 1
fi

mkdir -p "$OUT_DIR" "$POSTER_DIR"

trim_args=(-ss "$TRIM_START")
[[ -n $TRIM_DURATION ]] && trim_args+=(-t "$TRIM_DURATION")

# fps and scale run before the split so the reverse buffer holds the smaller
# frames; reverse is the memory-hungry step in this chain.
chain() {
  local w=$1 h=$2
  echo "[0:v]fps=${FPS},scale=${w}:${h}:flags=lanczos,setsar=1,split[fwd][back];\
[back]reverse,trim=start_frame=1,setpts=PTS-STARTPTS[rev];\
[fwd][rev]concat=n=2:v=1[v]"
}

encode_mp4() {
  local w=$1 h=$2 crf=$3 out=$OUT_DIR/$NAME-$4.mp4
  echo "→ $out (h264 crf $crf)"
  ffmpeg -y -v error -stats "${trim_args[@]}" -i "$SOURCE" \
    -filter_complex "$(chain "$w" "$h")" -map '[v]' -an \
    -c:v libx264 -profile:v high -level 4.0 -preset slow -crf "$crf" \
    -pix_fmt yuv420p -movflags +faststart "$out"
}

encode_webm() {
  local w=$1 h=$2 crf=$3 out=$OUT_DIR/$NAME-$4.webm
  echo "→ $out (vp9 crf $crf)"
  ffmpeg -y -v error -stats "${trim_args[@]}" -i "$SOURCE" \
    -filter_complex "$(chain "$w" "$h")" -map '[v]' -an \
    -c:v libvpx-vp9 -crf "$crf" -b:v 0 -deadline good -cpu-used 2 -row-mt 1 \
    -pix_fmt yuv420p "$out"
}

encode_mp4 1920 1080 "$CRF_1080" 1080
encode_mp4 1280 720 "$CRF_720" 720
encode_mp4 640 360 "$CRF_640" 640

if [[ $WEBM == 1 ]]; then
  encode_webm 1920 1080 "$VP9_1080" 1080
  encode_webm 1280 720 "$VP9_720" 720
  encode_webm 640 360 "$VP9_640" 640
fi

# The poster is the first frame of the trimmed clip, so the still the visitor
# sees before playback starts is the frame the video opens on.
echo "→ $POSTER_DIR/$NAME-poster.{jpg,webp}"
ffmpeg -y -v error -ss "$TRIM_START" -i "$SOURCE" \
  -vf "scale=3840:2160:flags=lanczos:force_original_aspect_ratio=decrease" -frames:v 1 \
  -q:v 2 "$POSTER_DIR/$NAME-poster.jpg"
ffmpeg -y -v error -ss "$TRIM_START" -i "$SOURCE" \
  -vf "scale=3840:2160:flags=lanczos:force_original_aspect_ratio=decrease" -frames:v 1 \
  -c:v libwebp -quality 88 "$POSTER_DIR/$NAME-poster.webp"

echo
echo "Built from $SOURCE:"
ls -lh "$OUT_DIR"/$NAME-*.mp4 "$OUT_DIR"/$NAME-*.webm "$POSTER_DIR"/$NAME-poster.* 2>/dev/null |
  awk '{ printf "  %-52s %s\n", $9, $5 }'
