import { describe, it, expect } from "vitest";
import { MEDITATIONS, findMeditation } from "./meditations";
import { STORIES } from "./stories";
import { estimatedDurationSec, isPauseMarker, parsePauseMs, spokenText } from "./spoken";

describe("冥想内容", () => {
  it("至少 6 篇引导脚本", () => {
    expect(MEDITATIONS.length).toBeGreaterThanOrEqual(6);
  });

  it("每篇都有非空段落且都是非空字符串", () => {
    for (const m of MEDITATIONS) {
      expect(m.paragraphs.length).toBeGreaterThan(0);
      for (const p of m.paragraphs) {
        expect(typeof p).toBe("string");
        expect(p.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it("id 均以 med- 前缀且唯一", () => {
    const ids = MEDITATIONS.map((m) => m.id);
    for (const id of ids) expect(id.startsWith("med-")).toBe(true);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("与故事 id 不碰撞", () => {
    const storyIds = new Set(STORIES.map((s) => s.id));
    for (const m of MEDITATIONS) expect(storyIds.has(m.id)).toBe(false);
  });

  it("覆盖 PMR / 身体扫描 / 正念 / 担忧卸载四类", () => {
    const kinds = new Set(MEDITATIONS.map((m) => m.kind));
    expect(kinds.has("pmr")).toBe(true);
    expect(kinds.has("bodyscan")).toBe(true);
    expect(kinds.has("mindfulness")).toBe(true);
    expect(kinds.has("worry")).toBe(true);
  });

  it("正念 5/10/15 分钟脚本的朗读内容和估算时长逐级增加", () => {
    const mind5 = findMeditation("med-mind-5");
    const mind10 = findMeditation("med-mind-10");
    const mind15 = findMeditation("med-mind-15");

    expect(mind5).toBeDefined();
    expect(mind10).toBeDefined();
    expect(mind15).toBeDefined();
    expect(spokenText(mind10!.paragraphs).length).toBeGreaterThan(spokenText(mind5!.paragraphs).length);
    expect(spokenText(mind15!.paragraphs).length).toBeGreaterThan(spokenText(mind10!.paragraphs).length);
    expect(estimatedDurationSec(mind10!.paragraphs)).toBeGreaterThan(estimatedDurationSec(mind5!.paragraphs));
    expect(estimatedDurationSec(mind15!.paragraphs)).toBeGreaterThan(estimatedDurationSec(mind10!.paragraphs));
  });

  it("正念 5/10/15 分钟脚本内容互不相同", () => {
    const scripts = ["med-mind-5", "med-mind-10", "med-mind-15"].map((id) =>
      spokenText(findMeditation(id)!.paragraphs).join("\n"),
    );

    expect(new Set(scripts).size).toBe(3);
  });

  it("正念 5 分钟不复用 10 分钟的核心引导内容", () => {
    const mind5Text = spokenText(findMeditation("med-mind-5")!.paragraphs).join("");
    const mind10Paras = new Set(spokenText(findMeditation("med-mind-10")!.paragraphs));

    for (const p of spokenText(findMeditation("med-mind-5")!.paragraphs)) {
      expect(mind10Paras.has(p)).toBe(false);
    }
    for (const phrase of ["周围的声音", "进来", "出去", "计划", "回忆", "担心", "判断", "睡意", "身体已经开始降速"]) {
      expect(mind5Text.includes(phrase)).toBe(false);
    }
  });

  it("正念 5/10/15 分钟脚本使用显式静默停顿并接近标注时长", () => {
    const ranges: Record<string, [number, number]> = {
      "med-mind-5": [290, 310],
      "med-mind-10": [590, 610],
      "med-mind-15": [890, 910],
    };

    for (const [id, [min, max]] of Object.entries(ranges)) {
      const med = findMeditation(id);
      expect(med).toBeDefined();
      expect(med!.paragraphs.some(isPauseMarker)).toBe(true);
      expect(estimatedDurationSec(med!.paragraphs)).toBeGreaterThanOrEqual(min);
      expect(estimatedDurationSec(med!.paragraphs)).toBeLessThanOrEqual(max);
    }
  });

  it("静默停顿标记不会进入实际朗读文本", () => {
    const mind5 = findMeditation("med-mind-5")!;

    expect(parsePauseMs("[[pause:8.5]]")).toBe(8500);
    expect(spokenText(mind5.paragraphs).some((p) => p.includes("[[pause:"))).toBe(false);
  });

  it("findMeditation 命中与未命中", () => {
    expect(findMeditation("med-pmr")?.id).toBe("med-pmr");
    expect(findMeditation("nope")).toBeUndefined();
    expect(findMeditation(null)).toBeUndefined();
  });
});
