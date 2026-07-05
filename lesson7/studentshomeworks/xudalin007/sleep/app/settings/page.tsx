"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { useHydrated } from "@/lib/hooks";
import { exportStateAsJSON } from "@/lib/storage";
import { Button } from "@/components/ui/Button";
import { useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { SelectGroup } from "@/components/ui/SelectGroup";
import type { AppSettings } from "@/lib/types";
import { ALIYUN_VOICES, EDGE_VOICES, probeCloudTTS } from "@/lib/cloud-tts";
import { authHref } from "@/lib/auth-links";
import Link from "next/link";

export default function SettingsPage() {
  const ready = useHydrated();
  const router = useRouter();
  const settings = useStore((s) => s.settings);
  const updateSettings = useStore((s) => s.updateSettings);
  const profile = useStore((s) => s.profile);
  const account = useStore((s) => s.account);
  const accountLoaded = useStore((s) => s.accountLoaded);
  const loadAccount = useStore((s) => s.loadAccount);
  const allState = useStore((s) => ({
    profile: s.profile,
    diaries: s.diaries,
    scores: s.scores,
    plans: s.plans,
    planTasks: s.planTasks,
    practices: s.practices,
    insights: s.insights,
    riskFlags: s.riskFlags,
    worries: s.worries,
    reframes: s.reframes,
    favoriteSounds: s.favoriteSounds,
    recentSounds: s.recentSounds,
    settings: s.settings,
  }));
  const reset = useStore((s) => s.resetAll);

  const [confirming, setConfirming] = useState(false);
  const [cloudProbe, setCloudProbe] = useState<{ engines?: { edge?: { ready: boolean }; aliyun?: { ready: boolean } } } | null>(null);

  useEffect(() => {
    if (!accountLoaded) void loadAccount();
  }, [accountLoaded, loadAccount]);

  useEffect(() => {
    if (!ready || !account) return;
    void probeCloudTTS().then(setCloudProbe);
  }, [ready, account]);

  if (!ready) {
    return <div className="px-5 pt-12 text-ink-400">载入中…</div>;
  }

  const exportData = () => {
    const json = exportStateAsJSON(allState);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hush-export-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const onConfirmReset = async () => {
    await reset();
    router.replace("/onboarding");
  };

  return (
    <div className="px-5 pt-10 pb-12 space-y-5">
      <header>
        <h1 className="text-2xl font-medium">设置</h1>
      </header>

      <section className="space-y-2">
        <div className="text-sm text-ink-500 dark:text-ink-300 px-1">外观</div>
        <Card>
          <div className="text-sm text-ink-500 dark:text-ink-300 mb-2">
            主题模式
          </div>
          <SelectGroup<AppSettings["themeMode"]>
            options={[
              {
                value: "system",
                label: "跟随系统",
              },
              {
                value: "auto-night",
                label: "按时间段自动",
                hint: `${settings.autoNightStart}–${settings.autoNightEnd}`,
              },
              {
                value: "dark",
                label: "始终深色",
              },
            ]}
            value={settings.themeMode}
            onChange={(v) => updateSettings({ themeMode: v })}
            columns={1}
          />
        </Card>

        {settings.themeMode === "auto-night" && (
          <Card className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm">
                <div className="text-ink-500 dark:text-ink-300 mb-1">夜间开始</div>
                <input
                  type="time"
                  value={settings.autoNightStart}
                  onChange={(e) =>
                    updateSettings({ autoNightStart: e.target.value })
                  }
                  className="w-full text-base bg-transparent outline-none"
                />
              </label>
              <label className="block text-sm">
                <div className="text-ink-500 dark:text-ink-300 mb-1">夜间结束</div>
                <input
                  type="time"
                  value={settings.autoNightEnd}
                  onChange={(e) =>
                    updateSettings({ autoNightEnd: e.target.value })
                  }
                  className="w-full text-base bg-transparent outline-none"
                />
              </label>
            </div>
          </Card>
        )}
      </section>

      <section className="space-y-2">
        <div className="text-sm text-ink-500 dark:text-ink-300 px-1">提醒</div>
        <Card className="space-y-3">
          <label className="flex items-center justify-between">
            <span>启用提醒</span>
            <input
              type="checkbox"
              checked={settings.notificationsEnabled}
              onChange={(e) =>
                updateSettings({ notificationsEnabled: e.target.checked })
              }
              className="accent-moon-500 w-5 h-5"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm">
              <div className="text-ink-500 dark:text-ink-300 mb-1">
                上床提醒
              </div>
              <input
                type="time"
                value={settings.bedtimeReminderTime}
                onChange={(e) =>
                  updateSettings({ bedtimeReminderTime: e.target.value })
                }
                className="w-full text-base bg-transparent outline-none"
              />
            </label>
            <label className="block text-sm">
              <div className="text-ink-500 dark:text-ink-300 mb-1">
                日记提醒
              </div>
              <input
                type="time"
                value={settings.diaryReminderTime}
                onChange={(e) =>
                  updateSettings({ diaryReminderTime: e.target.value })
                }
                className="w-full text-base bg-transparent outline-none"
              />
            </label>
          </div>
          <p className="text-xs text-ink-400 dark:text-ink-300">
            原型版本仅记录设置；正式版本会通过本地通知触发。
          </p>
        </Card>
      </section>

      <section className="space-y-2">
        <div className="text-sm text-ink-500 dark:text-ink-300 px-1">隐私</div>
        <Card className="space-y-3">
          <label className="flex items-center justify-between">
            <div>
              <div>诊断数据上传</div>
              <div className="text-xs text-ink-400 dark:text-ink-300 mt-0.5">
                仅匿名崩溃信息，默认关闭
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.diagnosticUploadEnabled}
              onChange={(e) =>
                updateSettings({
                  diagnosticUploadEnabled: e.target.checked,
                })
              }
              className="accent-moon-500 w-5 h-5"
            />
          </label>
        </Card>
      </section>

      <section className="space-y-2">
        <div className="text-sm text-ink-500 dark:text-ink-300 px-1">AI 朗读（睡前故事）</div>
        <Card className="space-y-3">
          <div className="text-xs text-ink-500 dark:text-ink-300 leading-relaxed">
            首次合成需联网，结果缓存到本地 IndexedDB 后离线可用。
          </div>

          {!account && (
            <div className="rounded-soft border border-dashed border-ink-200 dark:border-ink-700 bg-ink-50 dark:bg-ink-900/40 p-3 space-y-2">
              <label className="flex items-center justify-between opacity-50">
                <div>
                  <div>启用 AI 朗读</div>
                  <div className="text-xs text-ink-400 dark:text-ink-300 mt-0.5">
                    登录后可用
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={false}
                  disabled
                  className="accent-moon-500 w-5 h-5"
                />
              </label>
              <p className="text-xs text-ink-400 dark:text-ink-300 leading-relaxed">
                匿名模式可使用基础功能；阿里云 CosyVoice 与 Edge TTS 登录后开放。
              </p>
              <Link
                href={authHref("login", "/settings")}
                className="inline-block text-sm text-moon-600 dark:text-moon-200"
              >
                去登录 →
              </Link>
            </div>
          )}

          {account && cloudProbe === null && (
            <div className="text-xs text-ink-400 dark:text-ink-300">检测服务端状态…</div>
          )}

          {account && <div className="flex items-center gap-2 text-xs">
            <span className={cloudProbe?.engines?.aliyun?.ready ? "text-score-high" : "text-ink-400"}>
              {cloudProbe?.engines?.aliyun?.ready ? "✅" : "⚠️"} 阿里云 CosyVoice（默认）
            </span>
          </div>}
          {account && <div className="flex items-center gap-2 text-xs">
            <span className={cloudProbe?.engines?.edge?.ready ? "text-score-high" : "text-ink-400"}>
              {cloudProbe?.engines?.edge?.ready ? "✅" : "⚠️"} Edge TTS（免费备用）
            </span>
          </div>}

          {account && <label className="flex items-center justify-between">
            <div>
              <div>启用 AI 朗读</div>
              <div className="text-xs text-ink-400 dark:text-ink-300 mt-0.5">关闭时使用浏览器原生语音</div>
            </div>
            <input
              type="checkbox"
              checked={settings.cloudTTSEnabled ?? false}
              onChange={(e) => updateSettings({ cloudTTSEnabled: e.target.checked })}
              className="accent-moon-500 w-5 h-5"
            />
          </label>}

          {account && settings.cloudTTSEnabled && (
            <>
              <label className="block text-sm">
                <div className="text-ink-500 dark:text-ink-300 mb-1">引擎</div>
                <select
                  value={settings.ttsCloudEngine ?? "aliyun"}
                  onChange={(e) => {
                    const eng = e.target.value as "edge" | "aliyun";
                    // 切换引擎时自动切到该引擎的默认 voice
                    const defaultVoice = eng === "aliyun" ? "default" : "zh-CN-XiaoxiaoNeural";
                    updateSettings({ ttsCloudEngine: eng, ttsCloudVoice: defaultVoice });
                  }}
                  className="w-full px-3 py-2 rounded-soft bg-white dark:bg-ink-900 border border-ink-200 dark:border-ink-700 text-sm"
                >
                  <option value="aliyun">阿里云 CosyVoice（高保真 · 默认）</option>
                  <option value="edge">Edge TTS（免费备用）</option>
                </select>
              </label>

              <label className="block text-sm">
                <div className="text-ink-500 dark:text-ink-300 mb-1">音色</div>
                <select
                  value={settings.ttsCloudVoice ?? ((settings.ttsCloudEngine ?? "aliyun") === "aliyun" ? "default" : "zh-CN-XiaoxiaoNeural")}
                  onChange={(e) => updateSettings({ ttsCloudVoice: e.target.value })}
                  className="w-full px-3 py-2 rounded-soft bg-white dark:bg-ink-900 border border-ink-200 dark:border-ink-700 text-sm"
                >
                  {(settings.ttsCloudEngine ?? "aliyun") === "aliyun"
                    ? ALIYUN_VOICES.map((v) => (<option key={v.id} value={v.id}>{v.label}</option>))
                    : EDGE_VOICES.map((v) => (<option key={v.id} value={v.id}>{v.label}</option>))}
                </select>
              </label>
            </>
          )}
        </Card>
      </section>

      <section className="space-y-2">
        <div className="text-sm text-ink-500 dark:text-ink-300 px-1">数据</div>
        <Card className="space-y-3">
          <Button block variant="outline" onClick={exportData}>
            导出我的数据 (JSON)
          </Button>
          {!confirming ? (
            <Button
              block
              variant="danger-soft"
              onClick={() => setConfirming(true)}
            >
              清空全部数据
            </Button>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-ink-500 dark:text-ink-300">
                这会移除所有日记、计划与设置。无法恢复。
              </p>
              <div className="flex gap-2">
                <Button block variant="ghost" onClick={() => setConfirming(false)}>
                  取消
                </Button>
                <Button block variant="danger-soft" onClick={onConfirmReset}>
                  我确定，清空
                </Button>
              </div>
            </div>
          )}
        </Card>
      </section>

      <section className="space-y-2">
        <div className="text-sm text-ink-500 dark:text-ink-300 px-1">关于</div>
        <Card>
          <div className="text-sm text-ink-500 dark:text-ink-300">
            版本 v0.1 · 原型构建
          </div>
          {profile && (
            <div className="text-xs text-ink-400 mt-1 break-all">
              用户 ID：{profile.userId}
            </div>
          )}
        </Card>
      </section>
    </div>
  );
}
