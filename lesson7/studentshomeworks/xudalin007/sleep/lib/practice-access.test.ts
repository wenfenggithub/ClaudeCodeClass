import { describe, expect, it } from "vitest";
import {
  RELAXATION_PRACTICE_KINDS,
  canUseRelaxationPractice,
} from "./practice-access";

describe("practice access", () => {
  it("匿名模式不能使用任何放松训练", () => {
    for (const kind of RELAXATION_PRACTICE_KINDS) {
      expect(canUseRelaxationPractice(kind, false)).toBe(false);
    }
  });

  it("登录后可以使用放松训练", () => {
    for (const kind of RELAXATION_PRACTICE_KINDS) {
      expect(canUseRelaxationPractice(kind, true)).toBe(true);
    }
  });
});
