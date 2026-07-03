import { describe, expect, it } from "vitest";
import {
  ANONYMOUS_SOUND_BY_CATEGORY,
  canPlaySoundAnonymously,
  canUseSound,
} from "./sound-access";
import { SOUND_CATEGORIES, SOUNDS } from "./sound-catalog";

describe("sound access", () => {
  it("匿名模式每个分类只开放一个声音", () => {
    for (const category of SOUND_CATEGORIES) {
      const free = SOUNDS.filter((s) =>
        s.category === category.id && canPlaySoundAnonymously(s),
      );

      expect(free.map((s) => s.id)).toEqual([
        ANONYMOUS_SOUND_BY_CATEGORY[category.id],
      ]);
    }
  });

  it("登录后可播放全部声音", () => {
    for (const sound of SOUNDS) {
      expect(canUseSound(sound, true)).toBe(true);
    }
  });
});
