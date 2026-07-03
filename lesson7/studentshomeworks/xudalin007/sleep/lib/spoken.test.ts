import { describe, expect, it } from "vitest";
import {
  BROWSER_TTS_PARAGRAPH_GAP_MS,
  estimatedDurationSec,
  isPauseMarker,
  parsePauseMs,
  spokenText,
} from "./spoken";

describe("spoken helpers", () => {
  it("解析显式静默停顿标记", () => {
    expect(parsePauseMs("[[pause:8]]")).toBe(8000);
    expect(parsePauseMs(" [[pause:1.5]] ")).toBe(1500);
    expect(parsePauseMs("[[pause:0]]")).toBeNull();
    expect(parsePauseMs("普通文本")).toBeNull();
  });

  it("过滤静默停顿标记，只保留朗读文本", () => {
    const paragraphs = ["第一段", "[[pause:2]]", "第二段"];

    expect(isPauseMarker(paragraphs[1])).toBe(true);
    expect(spokenText(paragraphs)).toEqual(["第一段", "第二段"]);
  });

  it("估算时长包含朗读、显式静默和段间空白", () => {
    const paragraphs = ["一二三四五", "[[pause:2]]", "六七八九十"];
    const duration = estimatedDurationSec(paragraphs, {
      charsPerMinute: 60,
      paragraphGapMs: BROWSER_TTS_PARAGRAPH_GAP_MS,
    });

    expect(duration).toBe(13);
  });
});
