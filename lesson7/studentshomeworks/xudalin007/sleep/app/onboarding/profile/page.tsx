"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SelectGroup } from "@/components/ui/SelectGroup";
import { Slider } from "@/components/ui/Slider";
import { uid } from "@/lib/uid";
import {
  checkInitialRisk,
  newFlag,
} from "@/lib/risk";
import type {
  AgeRange,
  Gender,
  TroubleDuration,
  TroubleType,
  UserProfile,
  WorkPattern,
} from "@/lib/types";

export default function ProfilePage() {
  const router = useRouter();
  const setProfile = useStore((s) => s.setProfile);
  const addRiskFlag = useStore((s) => s.addRiskFlag);

  const [step, setStep] = useState(0);

  const [nickname, setNickname] = useState("");
  const [gender, setGender] = useState<Gender | null>(null);
  const [ageRange, setAgeRange] = useState<AgeRange | null>(null);
  const [bedtime, setBedtime] = useState("23:30");
  const [waketime, setWaketime] = useState("07:00");
  const [targetMin, setTargetMin] = useState(450); // 7.5h
  const [troubleTypes, setTroubleTypes] = useState<TroubleType[]>([]);
  const [troubleDuration, setTroubleDuration] = useState<TroubleDuration | null>(null);
  const [severity, setSeverity] = useState(3);
  const [workPattern, setWorkPattern] = useState<WorkPattern | null>(null);

  const totalSteps = 6;

  const next = () => setStep((s) => Math.min(totalSteps - 1, s + 1));
  const prev = () => setStep((s) => Math.max(0, s - 1));

  const submit = async () => {
    const profile: UserProfile = {
      userId: uid(),
      createdAt: new Date().toISOString(),
      nickname: nickname.trim() || undefined,
      gender: gender ?? undefined,
      ageRange: ageRange ?? undefined,
      targetBedtime: bedtime,
      targetWakeTime: waketime,
      targetSleepMin: targetMin,
      troubleTypes: troubleTypes.length === 0 ? ["unknown"] : troubleTypes,
      troubleDuration: troubleDuration ?? "lt_1m",
      severity: severity as UserProfile["severity"],
      workPattern: workPattern ?? undefined,
      timezone:
        typeof Intl !== "undefined"
          ? Intl.DateTimeFormat().resolvedOptions().timeZone
          : "Asia/Shanghai",
      locale: "zh-CN",
      disclaimerAcceptedAt: new Date().toISOString(),
    };
    await setProfile(profile);

    const { flags } = checkInitialRisk(profile);
    for (const f of flags) {
      await addRiskFlag(newFlag(profile.userId, f));
    }

    router.replace("/onboarding/plan");
  };

  const valid = (() => {
    switch (step) {
      case 0:
        return true; // 昵称可选
      case 1:
        return ageRange != null;
      case 2:
        return targetMin > 0;
      case 3:
        return true;
      case 4:
        return troubleDuration != null;
      case 5:
        return true;
      default:
        return false;
    }
  })();

  return (
    <div className="min-h-dvh px-6 pt-12 pb-10">
      {/* 进度 */}
      <div className="flex gap-1.5 mb-8">
        {Array.from({ length: totalSteps }).map((_, i) => (
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

      {step === 0 && (
        <section className="space-y-5">
          <h1 className="text-2xl font-medium">怎么称呼你？</h1>
          <p className="text-sm text-ink-500 dark:text-ink-300">
            可以用任意名字，也可以留空。我们不会向外发送。
          </p>
          <input
            type="text"
            placeholder="比如：小月亮"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="w-full px-4 py-3 rounded-soft bg-white dark:bg-ink-800 border border-ink-200 dark:border-ink-700 text-base"
          />
        </section>
      )}

      {step === 1 && (
        <section className="space-y-5">
          <h1 className="text-2xl font-medium">一些基础信息</h1>
          <div>
            <div className="text-sm text-ink-500 dark:text-ink-300 mb-2">
              你的年龄段
            </div>
            <SelectGroup<AgeRange>
              options={[
                { value: "18-24", label: "18–24" },
                { value: "25-34", label: "25–34" },
                { value: "35-44", label: "35–44" },
                { value: "45-54", label: "45–54" },
                { value: "55+", label: "55 +" },
              ]}
              value={ageRange}
              onChange={setAgeRange}
              columns={3}
            />
          </div>
          <div>
            <div className="text-sm text-ink-500 dark:text-ink-300 mb-2">
              性别（可选）
            </div>
            <SelectGroup<Gender>
              options={[
                { value: "female", label: "女" },
                { value: "male", label: "男" },
                { value: "other", label: "其他" },
                { value: "prefer_not", label: "不想说" },
              ]}
              value={gender}
              onChange={setGender}
              columns={2}
            />
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="space-y-6">
          <h1 className="text-2xl font-medium">你期望的作息</h1>
          <Card>
            <div className="text-sm text-ink-500 dark:text-ink-300 mb-1">
              希望的上床时间
            </div>
            <input
              type="time"
              value={bedtime}
              onChange={(e) => setBedtime(e.target.value)}
              className="w-full text-2xl bg-transparent outline-none"
            />
          </Card>
          <Card>
            <div className="text-sm text-ink-500 dark:text-ink-300 mb-1">
              希望的起床时间
            </div>
            <input
              type="time"
              value={waketime}
              onChange={(e) => setWaketime(e.target.value)}
              className="w-full text-2xl bg-transparent outline-none"
            />
          </Card>
          <Card>
            <Slider
              label="希望每天睡多少"
              min={5 * 60}
              max={10 * 60}
              step={15}
              value={targetMin}
              onChange={setTargetMin}
              formatValue={(v) =>
                `${Math.floor(v / 60)} 小时${v % 60 ? ` ${v % 60} 分钟` : ""}`
              }
            />
          </Card>
        </section>
      )}

      {step === 3 && (
        <section className="space-y-5">
          <h1 className="text-2xl font-medium">最让你困扰的是？</h1>
          <p className="text-sm text-ink-500 dark:text-ink-300">
            可以多选。如果不确定，也可以选「我也说不清」。
          </p>
          <SelectGroup<TroubleType>
            multiple
            options={[
              { value: "hard_to_fall_asleep", label: "入睡困难" },
              { value: "easy_to_wake", label: "半夜易醒" },
              { value: "early_wake", label: "早醒" },
              { value: "many_dreams", label: "多梦" },
              { value: "snoring", label: "打鼾" },
              { value: "unknown", label: "我也说不清" },
            ]}
            value={troubleTypes}
            onChange={setTroubleTypes}
            columns={2}
          />
        </section>
      )}

      {step === 4 && (
        <section className="space-y-6">
          <h1 className="text-2xl font-medium">这些困扰持续多久了？</h1>
          <SelectGroup<TroubleDuration>
            options={[
              { value: "lt_1m", label: "不到 1 个月" },
              { value: "1_3m", label: "1–3 个月" },
              { value: "3_6m", label: "3–6 个月" },
              { value: "6_12m", label: "6–12 个月" },
              { value: "gt_1y", label: "1 年以上" },
            ]}
            value={troubleDuration}
            onChange={setTroubleDuration}
            columns={1}
          />

          <Card>
            <Slider
              label="主观严重程度（1 = 轻微，5 = 严重影响生活）"
              min={1}
              max={5}
              value={severity}
              onChange={setSeverity}
              formatValue={(v) => `${v} / 5`}
            />
          </Card>
        </section>
      )}

      {step === 5 && (
        <section className="space-y-5">
          <h1 className="text-2xl font-medium">你的工作模式</h1>
          <p className="text-sm text-ink-500 dark:text-ink-300">
            这有助于我们给你更贴合的作息建议。
          </p>
          <SelectGroup<WorkPattern>
            options={[
              { value: "fixed", label: "固定作息（朝九晚五）" },
              { value: "flexible", label: "弹性时间" },
              { value: "shift", label: "倒班/夜班" },
              { value: "student", label: "学生" },
              { value: "freelance", label: "自由职业" },
            ]}
            value={workPattern}
            onChange={setWorkPattern}
            columns={1}
          />
        </section>
      )}

      <div className="mt-10 flex gap-3">
        {step > 0 && (
          <Button variant="ghost" onClick={prev}>
            上一步
          </Button>
        )}
        {step < totalSteps - 1 && (
          <Button block disabled={!valid} onClick={next}>
            下一步
          </Button>
        )}
        {step === totalSteps - 1 && (
          <Button block onClick={submit}>
            完成，开始陪伴
          </Button>
        )}
      </div>
    </div>
  );
}
