#!/usr/bin/env bash
#
# import-sounds.sh —— 把 ~/Downloads 的 mp3 归位到 public/sounds/
#
# 默认：按文件名关键词自动匹配 19 个目标，列出方案 → 回车确认 → 全部归位
# 输入 e 切换到交互模式（处理未匹配项）
# 输入 n 退出
#
# 兼容 macOS 自带 bash 3.2

set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DOWNLOADS="${HOME}/Downloads"
DEST="${ROOT}/public/sounds"

# 目标文件清单（id → 中文描述）
TARGETS=(
  "cat-purr:猫呼噜 · 低频振动"
  "heartbeat:心跳 · 慢节拍"
  "train:远去的火车 · 隆隆"
  "wind-snow:窗外风雪 · 寒风呼啸"
  "music-piano-1:月光钢琴 · 慢钢琴独奏"
  "music-piano-2:安静的旋律 · 简约钢琴"
  "music-piano-3:雨夜琴声 · 带回响"
  "music-piano-4:Lo-Fi 钢琴 · 长篇陪伴"
  "music-piano-5:钢琴时刻 · 安静留白"
  "music-piano-6:轻步钢琴 · 跳跃小品"
  "music-piano-strings:钢琴与弦 · 交织铺开"
  "music-strings:暖弦乐 · 长音"
  "music-strings-2:远方的弦 · 极简铺底"
  "music-guitar:吉他独白 · 指弹"
  "music-cello:大提琴夜曲 · 低沉"
  "music-ambient:深空环境 · 电子环境音"
  "music-ambient-2:寂静片段 · 极慢"
  "music-ambient-3:简单的梦 · 合成铺底"
  "music-forest-lullaby:森林摇篮曲 · 自然+音乐"
)

if [ ! -d "$DOWNLOADS" ]; then
  echo "❌ 没找到 $DOWNLOADS"
  exit 1
fi
mkdir -p "$DEST"

echo "🔍 扫描 $DOWNLOADS 最近 24 小时的 mp3..."

MP3S=()
while IFS= read -r line; do
  MP3S+=("$line")
done < <(find "$DOWNLOADS" -maxdepth 2 -type f -iname "*.mp3" -mtime -1 2>/dev/null \
         | xargs -I {} stat -f "%m %N" {} 2>/dev/null \
         | sort -n | cut -d' ' -f2-)

if [ ${#MP3S[@]} -eq 0 ]; then
  echo "未发现 24 小时内下载的 mp3。"
  exit 0
fi

echo "发现 ${#MP3S[@]} 个候选 mp3。"
echo ""

# ──────────────────────────────────────────────────
# 并行数组实现 ASSIGN[target_id] = source_path
# ──────────────────────────────────────────────────
ASSIGN_KEYS=()
ASSIGN_VALS=()

assign_set() {
  local key="$1" val="$2" i
  for i in "${!ASSIGN_KEYS[@]}"; do
    if [ "${ASSIGN_KEYS[$i]}" = "$key" ]; then
      ASSIGN_VALS[$i]="$val"
      return
    fi
  done
  ASSIGN_KEYS+=("$key")
  ASSIGN_VALS+=("$val")
}

assign_get() {
  local key="$1" i
  for i in "${!ASSIGN_KEYS[@]}"; do
    if [ "${ASSIGN_KEYS[$i]}" = "$key" ]; then
      echo "${ASSIGN_VALS[$i]}"
      return
    fi
  done
}

assign_has() {
  local key="$1" i
  for i in "${!ASSIGN_KEYS[@]}"; do
    [ "${ASSIGN_KEYS[$i]}" = "$key" ] && return 0
  done
  return 1
}

# ──────────────────────────────────────────────────
# 自动匹配：按文件名关键词分类
# ──────────────────────────────────────────────────
PIANO_FILES=()
AMBIENT_FILES=()
USED_MP3S=()

for mp3 in "${MP3S[@]}"; do
  fname=$(basename "$mp3" | tr '[:upper:]' '[:lower:]')
  [[ "$fname" =~ \.crdownload$ ]] && continue

  matched=""
  case "$fname" in
    # ── 环境声（特异性优先） ──
    *purr*|*kitten*|*-cat-*|*meow*) matched="cat-purr" ;;
    *heart*beat*|*-heart-*) matched="heartbeat" ;;
    *-train-*|*train-passing*|*train-horn*|*distant-train*|*railroad*|*railway*) matched="train" ;;
    *howling*|*blizzard*|*snow-storm*|*winter-wind*|*cold-wind*) matched="wind-snow" ;;

    # ── 第二批：组合关键词的优先（必须在 piano/strings/ambient 之前） ──
    *piano*and*string*|*piano*amp*string*|*piano*strings*) matched="music-piano-strings" ;;
    *forest*lullaby*|*lullaby*forest*) matched="music-forest-lullaby" ;;

    # ── 单独 keyword：吉他/大提琴/纯弦乐 ──
    *guitar*) matched="music-guitar" ;;
    *cello*) matched="music-cello" ;;

    # ── 多槽收集：piano / ambient ──
    *piano*|*tip-toe*) PIANO_FILES+=("$mp3"); USED_MP3S+=("$mp3"); continue ;;
    *string*) matched="music-strings" ;;  # 走 strings 主槽
    *ambient*|*drone*|*void*|*dreamscape*|*meditation*|*spacious*|*ethereal*|*fragments-of-silence*|*simple-dreams*)
      AMBIENT_FILES+=("$mp3"); USED_MP3S+=("$mp3"); continue ;;

    # ── 回退 ──
    *wind*) matched="wind-snow" ;;
  esac

  if [ -n "$matched" ]; then
    # 主 strings 槽满了就放 strings-2
    if [ "$matched" = "music-strings" ] && assign_has "music-strings"; then
      if ! assign_has "music-strings-2"; then
        assign_set "music-strings-2" "$mp3"
        USED_MP3S+=("$mp3")
        continue
      fi
    fi
    if ! assign_has "$matched"; then
      assign_set "$matched" "$mp3"
      USED_MP3S+=("$mp3")
    fi
  fi
done

# piano 多槽（按下载时间升序填 1-6）
for i in "${!PIANO_FILES[@]}"; do
  slot=$((i+1))
  if [ $slot -le 6 ]; then
    assign_set "music-piano-$slot" "${PIANO_FILES[$i]}"
  fi
done

# ambient 多槽（主槽 + ambient-2 + ambient-3）
for i in "${!AMBIENT_FILES[@]}"; do
  if [ $i -eq 0 ]; then
    assign_set "music-ambient" "${AMBIENT_FILES[$i]}"
  elif [ $i -eq 1 ]; then
    assign_set "music-ambient-2" "${AMBIENT_FILES[$i]}"
  elif [ $i -eq 2 ]; then
    assign_set "music-ambient-3" "${AMBIENT_FILES[$i]}"
  fi
done

# ──────────────────────────────────────────────────
# 展示匹配方案
# ──────────────────────────────────────────────────
echo "📋 自动匹配方案（按文件名关键词）："
echo ""
MATCHED=0
for entry in "${TARGETS[@]}"; do
  id="${entry%%:*}"
  desc="${entry#*:}"
  src=$(assign_get "$id")
  if [ -n "$src" ]; then
    printf "  ✓ %-22s  ←  %s\n" "$id.mp3" "$(basename "$src")"
    MATCHED=$((MATCHED+1))
  else
    printf "  ✗ %-22s  （未匹配 · %s）\n" "$id.mp3" "$desc"
  fi
done

# 未分配的 mp3
UNASSIGNED_MP3S=()
for mp3 in "${MP3S[@]}"; do
  used=0
  for entry in "${TARGETS[@]}"; do
    id="${entry%%:*}"
    if [ "$(assign_get "$id")" = "$mp3" ]; then
      used=1; break
    fi
  done
  [ $used -eq 0 ] && UNASSIGNED_MP3S+=("$mp3")
done

echo ""
echo "═════════════════════════════════════"
echo "匹配 $MATCHED / ${#TARGETS[@]}，剩 ${#UNASSIGNED_MP3S[@]} 个 mp3 未分配（会跳过）"

if [ ${#UNASSIGNED_MP3S[@]} -gt 0 ]; then
  echo ""
  echo "📂 未分配的 mp3："
  for m in "${UNASSIGNED_MP3S[@]}"; do
    echo "    $(basename "$m")"
  done
fi

echo ""
echo "─────────────────────────────────────"
echo "  [回车] 应用自动匹配（${MATCHED} 条归位）"
echo "  [  e ] 切换到交互模式（处理未匹配项）"
echo "  [  n ] 退出"
read -rp "> " choice

case "$choice" in
  n|N) echo "已退出。"; exit 0 ;;
  e|E) INTERACTIVE=1 ;;
  *) INTERACTIVE=0 ;;
esac

# 应用自动匹配
PLACED=0
for entry in "${TARGETS[@]}"; do
  id="${entry%%:*}"
  src=$(assign_get "$id")
  if [ -n "$src" ]; then
    cp "$src" "$DEST/$id.mp3"
    size=$(stat -f "%z" "$DEST/$id.mp3" | awk '{printf "%.1f MB", $1/1024/1024}')
    printf "  ✓ %s  (%s)\n" "$id.mp3" "$size"
    PLACED=$((PLACED+1))
  fi
done

# 交互模式：处理未分配
if [ "$INTERACTIVE" -eq 1 ]; then
  for mp3 in "${UNASSIGNED_MP3S[@]}"; do
    fname=$(basename "$mp3")
    echo "─────────────────────────────────────"
    echo "📂 $fname"

    REM=()
    for entry in "${TARGETS[@]}"; do
      id="${entry%%:*}"
      [ ! -f "$DEST/$id.mp3" ] && REM+=("$entry")
    done

    if [ ${#REM[@]} -eq 0 ]; then
      echo "✅ 全部目标归位，跳过剩余 mp3。"
      break
    fi

    for i in "${!REM[@]}"; do
      id="${REM[$i]%%:*}"
      desc="${REM[$i]#*:}"
      printf "  [%2d] %-22s  %s\n" "$((i+1))" "$id.mp3" "$desc"
    done
    printf "  [ s] 跳过\n  [ q] 退出\n"
    read -rp "> " choice

    case "$choice" in
      q|Q) break ;;
      s|S|"") ;;
      *)
        if [[ "$choice" =~ ^[0-9]+$ ]]; then
          idx=$((choice-1))
          if [ $idx -ge 0 ] && [ $idx -lt ${#REM[@]} ]; then
            target_id="${REM[$idx]%%:*}"
            cp "$mp3" "$DEST/$target_id.mp3"
            echo "  ✓ 已复制为 $target_id.mp3"
            PLACED=$((PLACED+1))
          fi
        fi
        ;;
    esac
  done
fi

echo ""
echo "═════════════════════════════════════"
echo "完成：归位 $PLACED 条"
echo ""
echo "📋 状态总览："
for entry in "${TARGETS[@]}"; do
  id="${entry%%:*}"
  desc="${entry#*:}"
  if [ -f "$DEST/$id.mp3" ]; then
    size=$(stat -f "%z" "$DEST/$id.mp3" | awk '{printf "%.1f MB", $1/1024/1024}')
    printf "  ✓ %-22s  %s\n" "$id.mp3" "$size"
  else
    printf "  ✗ %-22s  %s\n" "$id.mp3" "$desc"
  fi
done

echo ""
echo "下一步：刷新 http://localhost:3100/sounds 看「真实录音」角标。"
