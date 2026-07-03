"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { AuthPanel } from "@/components/AuthPanel";

const SLIDES = [
  {
    title: "一晚比一晚好",
    body: "我们不追求一夜睡 8 小时，只想陪你慢慢往前走。每天 60 秒的记录，会变成你看得懂的睡眠地图。",
  },
  {
    title: "把方法递到你手里",
    body: "呼吸训练、刺激控制、睡眠卫生……都是经过研究的简单方法。每天给你 1–3 件能做的事，不堆砌。",
  },
  {
    title: "数据留在你这里",
    body: "睡眠记录默认存储在本地，不强制注册、不推送广告。你随时可以一键导出或清空。",
  },
  {
    title: "我们不替代医生",
    body: "这是一款生活方式工具，不能用于诊断或治疗。如果你的失眠已经持续很久或伴随其他困扰，请联系睡眠科或心理科。",
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [accepted, setAccepted] = useState(false);
  const isLast = step === SLIDES.length - 1;

  return (
    <div className="min-h-dvh px-6 pt-12 pb-10 flex flex-col">
      <div className="mb-5">
        <AuthPanel compact defaultExpanded={false} />
      </div>

      <div className="flex gap-1.5 mb-10">
        {SLIDES.map((_, i) => (
          <div
            key={i}
            className={
              "h-1 flex-1 rounded-full " +
              (i <= step
                ? "bg-moon-400 dark:bg-moon-300"
                : "bg-ink-100 dark:bg-ink-700")
            }
          />
        ))}
      </div>

      <div className="flex-1">
        <h1 className="text-3xl font-medium leading-snug">
          {SLIDES[step].title}
        </h1>
        <p className="text-base leading-relaxed text-ink-500 dark:text-ink-200 mt-6">
          {SLIDES[step].body}
        </p>
      </div>

      {isLast && (
        <label className="flex items-start gap-3 mb-6 text-sm text-ink-500 dark:text-ink-300">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            className="mt-1 accent-moon-500"
          />
          <span>
            我已阅读并理解：本应用是生活方式工具，不替代医生，不能用于诊断或治疗。
          </span>
        </label>
      )}

      <div className="flex gap-3">
        {step > 0 && (
          <Button variant="ghost" onClick={() => setStep(step - 1)}>
            上一步
          </Button>
        )}
        {!isLast && (
          <Button block onClick={() => setStep(step + 1)}>
            继续
          </Button>
        )}
        {isLast && (
          <Button
            block
            disabled={!accepted}
            onClick={() => router.push("/onboarding/profile")}
          >
            填写我的睡眠档案
          </Button>
        )}
      </div>
    </div>
  );
}
