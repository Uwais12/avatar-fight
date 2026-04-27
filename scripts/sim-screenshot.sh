#!/usr/bin/env bash
# Drive the iOS simulator through every armor/weapon combo via deep link
# and capture a rotated landscape screenshot for each.
set -e

UDID=F7F58F39-8DDC-4F0D-9025-DDA408B396DC
OUT=/Users/uwaisishaq/avatar-fight/test-screenshots
mkdir -p "$OUT"

# First, ensure Expo Go is running with the project loaded.
echo "▶ warming up Expo Go..."
xcrun simctl openurl "$UDID" "exp://127.0.0.1:8081" >/dev/null 2>&1
sleep 12

# Deep-link → screenshot → rotate 90° CW so the saved file is in true landscape orientation.
# We use openurl (not terminate+launch) so Expo Go stays warm and the bundle is cached.
shoot() {
  local label=$1
  local query=$2
  echo "▶ $label"
  xcrun simctl openurl "$UDID" "exp://127.0.0.1:8081/--/dev?$query" >/dev/null 2>&1
  sleep 4
  xcrun simctl io "$UDID" screenshot "$OUT/raw-$label.png" >/dev/null 2>&1
  python3 -c "
from PIL import Image
im = Image.open('$OUT/raw-$label.png').convert('RGB')
im.rotate(90, expand=True).save('$OUT/$label.png')
" 2>&1
  rm -f "$OUT/raw-$label.png"
}

# Hero screen combos
shoot "01-naked-knight"     "class=knight&weapon=&armor=&pets=0"
shoot "02-knight-sword"     "class=knight&weapon=sword&armor=&pets=0"
shoot "03-knight-leather"   "class=knight&weapon=&armor=leather&pets=0"
shoot "04-knight-plate-bow" "class=knight&weapon=bow&armor=plate&pets=0"
shoot "05-mage-robe-staff"  "class=mage&weapon=staff&armor=robe&pets=0"
shoot "06-archer-chain-bow" "class=archer&weapon=bow&armor=chain&pets=0"
shoot "07-vampire-3pets"    "class=vampire&weapon=staff&armor=plate&pets=3"
shoot "08-ninja-1pet"       "class=ninja&weapon=sword&armor=leather&pets=1"

# Other screens — navigate via deep links
deep_shoot() {
  local label=$1
  local route=$2
  echo "▶ $label"
  xcrun simctl openurl "$UDID" "exp://127.0.0.1:8081/--/$route" >/dev/null 2>&1
  sleep 4
  xcrun simctl io "$UDID" screenshot "$OUT/raw-$label.png" >/dev/null 2>&1
  python3 -c "
from PIL import Image
im = Image.open('$OUT/raw-$label.png').convert('RGB')
im.rotate(90, expand=True).save('$OUT/$label.png')
" 2>&1
  rm -f "$OUT/raw-$label.png"
}

deep_shoot "09-shop-weapons"  "shop"
deep_shoot "10-bag-gear"       "bag"
deep_shoot "11-arena"          "arena"

echo
echo "✓ Done — $(ls $OUT/*.png | wc -l | tr -d ' ') screenshots in $OUT"
