// 21 天计划模板 - spec.md 4.7

import { addDays, format } from "date-fns";
import type { PlanTask, SleepPlan } from "./types";
import { uid } from "./uid";

interface DayTemplate {
  title: string;
  description: string;
}

const PLAN_DEFAULT_NAME = "default-21-v1";

const WEEK1_FOCUS = "固定起床时间";
const WEEK2_FOCUS = "刺激控制：床=只睡觉";
const WEEK3_FOCUS = "睡眠卫生 + 睡前放松";

const WEEK1_TASKS: DayTemplate[] = [
  { title: "设置一个固定的起床时间", description: "选一个未来 7 天都能坚持的时间，包括周末。" },
  { title: "今天按时起床", description: "即使昨晚没睡好，也尽量按时起。这是节律重建的第一块基石。" },
  { title: "记录一次睡眠日记", description: "醒来后用 60 秒填一份早晨问卷。" },
  { title: "在自然光下待 10 分钟", description: "晨间光照能帮你校准生物钟。" },
  { title: "今天不补觉", description: "周末也按时起床，把睡眠压力留到晚上。" },
  { title: "下午 3 点后不喝咖啡", description: "包括茶、可乐、巧克力等含咖啡因饮品。" },
  { title: "为本周做一次小复盘", description: "回顾这 7 天的起床时间是否一致。" },
];

const WEEK2_TASKS: DayTemplate[] = [
  { title: "床上不刷手机", description: "把手机放在伸手够不到的地方，让大脑重新把床和睡眠联系起来。" },
  { title: "20 分钟规则", description: "如果躺下 20 分钟还没睡着，起身去客厅做点无聊的事，困了再回去。" },
  { title: "白天不在床上工作", description: "包括躺着刷视频、办公。" },
  { title: "睡前 30 分钟暗光", description: "把卧室主灯换成暖色台灯。" },
  { title: "尝试一次 4-7-8 呼吸", description: "5 分钟即可，找一个舒服的姿势。" },
  { title: "把烦心事写下来", description: "睡前 10 分钟「担忧时间」：写下来，归档，明天再想。" },
  { title: "本周复盘", description: "本周你是否做到「床=只睡觉」？哪一项最难坚持？" },
];

const WEEK3_TASKS: DayTemplate[] = [
  { title: "晚饭和上床间隔 ≥ 3 小时", description: "胃在夜间忙工作，会影响入睡。" },
  { title: "今天做一次白天运动", description: "强度不必大，散步、瑜伽都算。但避免睡前 2 小时剧烈运动。" },
  { title: "卧室温度 18–22°C", description: "稍微凉一点更利于入睡。" },
  { title: "尝试一次身体扫描冥想", description: "10 分钟，把注意力从头顶慢慢扫到脚底。" },
  { title: "今天不饮酒", description: "酒精会让你更快睡着，但严重破坏深睡眠。" },
  { title: "把闹钟挪出卧室", description: "如果你常半夜看时间，这个动作很有帮助。" },
  { title: "21 天总结", description: "回顾这三周你最大的变化是什么？最值得保留的是哪一项？" },
];

const ALL_DAYS: DayTemplate[] = [...WEEK1_TASKS, ...WEEK2_TASKS, ...WEEK3_TASKS];

export function createDefaultPlan(userId: string, startDate: Date) {
  const plan: SleepPlan = {
    planId: uid(),
    userId,
    templateId: PLAN_DEFAULT_NAME,
    startedAt: format(startDate, "yyyy-MM-dd"),
    currentDay: 1,
    status: "active",
    weeklyFocus: [WEEK1_FOCUS, WEEK2_FOCUS, WEEK3_FOCUS],
  };
  const tasks: PlanTask[] = ALL_DAYS.map((d, idx) => ({
    taskId: uid(),
    planId: plan.planId,
    dayIndex: idx + 1,
    title: d.title,
    description: d.description,
    done: false,
  }));
  return { plan, tasks };
}

export function planDayIndex(plan: SleepPlan, today: Date = new Date()): number {
  const start = new Date(`${plan.startedAt}T00:00:00`);
  const days = Math.floor(
    (today.getTime() - start.getTime()) / (24 * 60 * 60 * 1000),
  );
  return Math.max(1, Math.min(21, days + 1));
}

export function planDateOfDay(plan: SleepPlan, dayIndex: number): string {
  const start = new Date(`${plan.startedAt}T00:00:00`);
  return format(addDays(start, dayIndex - 1), "yyyy-MM-dd");
}
