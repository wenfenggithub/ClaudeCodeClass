// 4 种呼吸法配置 - spec.md 4.5
// 节律以毫秒为单位，支持非整数秒（如共振呼吸 5.5s）。

export type BreathPhase = "in" | "hold-in" | "out" | "hold-out";

export interface BreathStep {
  phase: BreathPhase;
  ms: number;
  label: string;
}

export interface BreathMethod {
  id: string;
  title: string;
  subtitle: string;
  desc: string;
  icon: string;
  defaultMin: number;
  steps: BreathStep[];
  cycleSec: number;
}

const cycleOf = (steps: BreathStep[]) =>
  steps.reduce((s, x) => s + x.ms, 0) / 1000;

const m_478: BreathMethod = (() => {
  const steps: BreathStep[] = [
    { phase: "in", ms: 4000, label: "吸气" },
    { phase: "hold-in", ms: 7000, label: "屏息" },
    { phase: "out", ms: 8000, label: "呼气" },
  ];
  return {
    id: "478",
    title: "4-7-8 呼吸",
    subtitle: "睡前主推 · 快速放松",
    desc: "用鼻子吸气 4 秒、屏息 7 秒、用嘴呼气 8 秒。激活副交感神经，帮你松下来。",
    icon: "🫧",
    defaultMin: 5,
    steps,
    cycleSec: cycleOf(steps),
  };
})();

const m_box: BreathMethod = (() => {
  const steps: BreathStep[] = [
    { phase: "in", ms: 4000, label: "吸气" },
    { phase: "hold-in", ms: 4000, label: "屏息" },
    { phase: "out", ms: 4000, label: "呼气" },
    { phase: "hold-out", ms: 4000, label: "屏息" },
  ];
  return {
    id: "box",
    title: "箱式呼吸",
    subtitle: "4-4-4-4 · 稳定专注",
    desc: "海军陆战队员的减压法。四个等长阶段，让大脑回到此刻。",
    icon: "▢",
    defaultMin: 5,
    steps,
    cycleSec: cycleOf(steps),
  };
})();

const m_abd: BreathMethod = (() => {
  const steps: BreathStep[] = [
    { phase: "in", ms: 4000, label: "吸气 · 让肚子鼓起来" },
    { phase: "out", ms: 6000, label: "呼气 · 让肚子缩回去" },
  ];
  return {
    id: "abd",
    title: "腹式呼吸",
    subtitle: "4-6 · 温和入门",
    desc: "把手放在小腹上感受起伏。最容易上手的一种，焦虑高的时候也能做。",
    icon: "○",
    defaultMin: 6,
    steps,
    cycleSec: cycleOf(steps),
  };
})();

const m_res: BreathMethod = (() => {
  // 5.5 次/分钟 = 60/5.5 ≈ 10.91 秒/周期 ≈ 5500ms 吸 + 5500ms 呼
  const steps: BreathStep[] = [
    { phase: "in", ms: 5500, label: "吸气" },
    { phase: "out", ms: 5500, label: "呼气" },
  ];
  return {
    id: "res",
    title: "共振呼吸",
    subtitle: "5.5 次/分钟 · HRV 友好",
    desc: "每分钟约 5.5 次呼吸的节律，被研究认为最容易激活心脏与呼吸的共振。",
    icon: "～",
    defaultMin: 7,
    steps,
    cycleSec: cycleOf(steps),
  };
})();

export const BREATH_METHODS: BreathMethod[] = [m_478, m_box, m_abd, m_res];

export function findMethod(id: string | null | undefined): BreathMethod {
  return BREATH_METHODS.find((m) => m.id === id) ?? m_478;
}
