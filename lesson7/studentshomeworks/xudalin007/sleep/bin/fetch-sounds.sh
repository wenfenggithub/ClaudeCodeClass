#!/usr/bin/env bash
#
# fetch-sounds.sh —— 一键拉取真实环境录音到 public/sounds/
#
# 数据源：bradtraversy/ambient-sound-mixer（MIT 协议）
#         https://github.com/bradtraversy/ambient-sound-mixer
#         教学项目，文件路径稳定，多年未变。
#
# 策略：5 条自然声接入真实录音；3 条纯色噪音（白/粉/棕）继续端侧合成
#       （合成纯噪音与真录音差距极小，没必要联网拉）
#
# 用法：bash bin/fetch-sounds.sh  或  npm run fetch-sounds

set -e

DEST="public/sounds"
mkdir -p "$DEST"

REPO="bradtraversy/ambient-sound-mixer"
REF="main"

# 应用约定的文件名 → 上游真实文件名
# 上游目录：audio/{birds,cafe,fireplace,night,ocean,rain,thunder,wind}.mp3
declare -a MAP=(
  "rain:rain.mp3"
  "ocean:ocean.mp3"
  "forest:night.mp3"       # "夜晚" 录音内含森林虫鸣
  "fire:fireplace.mp3"
  "fan:wind.mp3"           # 风声代替风扇（同属白噪音类）
)

# CDN 候选链路
CDN_TEMPLATES=(
  "https://raw.githubusercontent.com/${REPO}/${REF}/audio/SLUG"
  "https://cdn.jsdelivr.net/gh/${REPO}@${REF}/audio/SLUG"
  "https://cdn.statically.io/gh/${REPO}/${REF}/audio/SLUG"
)

try_download() {
  local target=$1
  local upstream=$2
  for tpl in "${CDN_TEMPLATES[@]}"; do
    local url="${tpl/SLUG/$upstream}"
    echo "  [try] $url"
    if curl -sSfL --max-time 90 -o "$DEST/$target.mp3.tmp" "$url"; then
      local size=$(wc -c < "$DEST/$target.mp3.tmp" | tr -d ' ')
      if [ "$size" -gt 50000 ]; then
        mv "$DEST/$target.mp3.tmp" "$DEST/$target.mp3"
        echo "  ✓ $target.mp3 ($(($size / 1024)) KB)"
        return 0
      else
        rm -f "$DEST/$target.mp3.tmp"
      fi
    fi
  done
  rm -f "$DEST/$target.mp3.tmp"
  return 1
}

echo "📥 拉取 5 条真实环境录音到 $DEST/ ..."
echo "    源：https://github.com/${REPO} (MIT 协议)"
echo "    白噪/粉噪/棕噪 3 条不下载——合成版本与录音差距极小。"
echo ""

OK=0; FAIL=0; FAILED_LIST=()
for entry in "${MAP[@]}"; do
  target="${entry%%:*}"
  upstream="${entry#*:}"
  echo "→ $target.mp3  (upstream: $upstream)"
  if try_download "$target" "$upstream"; then
    OK=$((OK+1))
  else
    FAIL=$((FAIL+1))
    FAILED_LIST+=("$target")
    echo "  ✗ 全部源失败"
  fi
  echo ""
done

echo "==============================="
echo "完成：$OK / 5 成功"
if [ "$FAIL" -gt 0 ]; then
  echo ""
  echo "失败列表：${FAILED_LIST[*]}"
  echo "可能原因：网络受限 / 上游改动 / DNS。"
  echo "手动方案：访问 https://github.com/${REPO}/tree/main/audio"
  echo "          下载对应 mp3，按映射重命名后放入 $DEST/"
  echo "  映射：rain.mp3=rain.mp3  ocean.mp3=ocean.mp3"
  echo "       forest.mp3=night.mp3  fire.mp3=fireplace.mp3  fan.mp3=wind.mp3"
fi

echo ""
echo "当前 $DEST 下的文件："
ls -lh "$DEST"/*.mp3 2>/dev/null || echo "  (空)"
