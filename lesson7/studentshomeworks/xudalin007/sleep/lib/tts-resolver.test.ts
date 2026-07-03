import { describe, it, expect } from "vitest";
import { preferredTTSEngine, resolveSpoken } from "./tts-engine";
import { STORIES } from "./stories";
import { MEDITATIONS } from "./meditations";
import { estimatedDurationSec } from "./spoken";

describe("resolveSpoken — 故事/冥想统一解析", () => {
  it("解析故事 id", () => {
    const s = STORIES[0];
    const r = resolveSpoken(s.id);
    expect(r?.id).toBe(s.id);
    expect(r?.paragraphs.length).toBe(s.paragraphs.length);
  });

  it("解析冥想 id", () => {
    const m = MEDITATIONS[0];
    const r = resolveSpoken(m.id);
    expect(r?.id).toBe(m.id);
    expect(r?.paragraphs.length).toBe(m.paragraphs.length);
  });

  it("未知 id 返回 undefined", () => {
    expect(resolveSpoken("does-not-exist")).toBeUndefined();
    expect(resolveSpoken(null)).toBeUndefined();
    expect(resolveSpoken(undefined)).toBeUndefined();
  });

  it("启用 AI 朗读时优先使用云端引擎", () => {
    expect(preferredTTSEngine({ useCloud: true })).toBe("cloud");
    expect(preferredTTSEngine({ useCloud: false })).toBe("browser");
    expect(preferredTTSEngine()).toBe("browser");
  });

  it("睡前故事估算时长接近 UI 显示时长", () => {
    for (const story of STORIES) {
      const duration = estimatedDurationSec(story.paragraphs);
      const target = story.estMinutes * 60;

      expect(duration).toBeGreaterThanOrEqual(target - 20);
      expect(duration).toBeLessThanOrEqual(target + 20);
    }
  });
});
