const PAUSE_RE = /^\[\[pause:(\d+(?:\.\d+)?)\]\]$/;
export const BROWSER_TTS_PARAGRAPH_GAP_MS = 1400;

export function parsePauseMs(text: string): number | null {
  const match = text.trim().match(PAUSE_RE);
  if (!match) return null;
  const sec = Number(match[1]);
  if (!Number.isFinite(sec) || sec <= 0) return null;
  return Math.round(sec * 1000);
}

export function isPauseMarker(text: string): boolean {
  return parsePauseMs(text) != null;
}

export function spokenText(paragraphs: string[]): string[] {
  return paragraphs.filter((p) => !isPauseMarker(p));
}

export function estimatedDurationSec(
  paragraphs: string[],
  opts: {
    charsPerMinute?: number;
    paragraphGapMs?: number;
  } = {},
): number {
  const pauseSec = paragraphs.reduce((sum, p) => {
    const pauseMs = parsePauseMs(p);
    return sum + (pauseMs == null ? 0 : pauseMs / 1000);
  }, 0);
  const chars = spokenText(paragraphs).join("").length;
  const gapMs = opts.paragraphGapMs ?? BROWSER_TTS_PARAGRAPH_GAP_MS;
  const gapCount = paragraphs.reduce((sum, p, idx) => {
    return sum + (!isPauseMarker(p) && idx < paragraphs.length - 1 ? 1 : 0);
  }, 0);
  // 中文系统语音常见约 210-260 字/分钟；这里用偏保守值估算。
  return Math.round(pauseSec + (gapCount * gapMs) / 1000 + (chars / (opts.charsPerMinute ?? 230)) * 60);
}
