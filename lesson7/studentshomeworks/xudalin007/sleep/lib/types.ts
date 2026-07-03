// 数据模型 - 对齐 spec.md 第 7 节

export type Gender = "male" | "female" | "other" | "prefer_not";
export type AgeRange = "18-24" | "25-34" | "35-44" | "45-54" | "55+";
export type TroubleDuration =
  | "lt_1m"
  | "1_3m"
  | "3_6m"
  | "6_12m"
  | "gt_1y";
export type WorkPattern =
  | "fixed"
  | "flexible"
  | "shift"
  | "student"
  | "freelance";
export type DeviceType = "none" | "watch" | "band";

export type TroubleType =
  | "hard_to_fall_asleep"
  | "easy_to_wake"
  | "early_wake"
  | "many_dreams"
  | "snoring"
  | "unknown";

export interface UserProfile {
  userId: string;
  createdAt: string; // ISO
  nickname?: string;
  gender?: Gender;
  ageRange?: AgeRange;
  heightCm?: number;
  weightKg?: number;
  targetBedtime: string; // HH:mm
  targetWakeTime: string; // HH:mm
  targetSleepMin: number; // 分钟
  troubleTypes: TroubleType[];
  troubleDuration: TroubleDuration;
  severity: 1 | 2 | 3 | 4 | 5;
  hasSeenDoctor?: boolean;
  workPattern?: WorkPattern;
  deviceType?: DeviceType;
  timezone: string;
  locale: string;
  disclaimerAcceptedAt?: string;
}

export type Caffeine = "none" | "morning" | "afternoon" | "evening";
export type Alcohol = "none" | "mild" | "heavy";
export type Exercise = "none" | "light" | "moderate" | "intense";
export type MorningState = "fresh" | "ok" | "tired" | "exhausted";
export type MoodTag =
  | "happy"
  | "calm"
  | "anxious"
  | "low"
  | "irritable"
  | "stressed";

/**
 * 睡眠日记。
 * date 字段约定为「上床那天」的本地日期（YYYY-MM-DD），跨午夜也归属上床那天。
 */
export interface SleepDiary {
  diaryId: string;
  userId: string;
  date: string; // YYYY-MM-DD
  bedtime: string; // ISO
  sleepLatencyMin: number; // 入睡耗时（分钟，区间中值）
  wakeCount: 0 | 1 | 2 | 3;
  wakeDurationMin: number; // 夜醒累计分钟
  wakeTime: string; // ISO
  timeInBedMin: number; // 卧床总时长
  totalSleepMin: number; // 实际睡眠时长
  sleepEfficiency: number; // 0-1
  subjectiveQuality: 1 | 2 | 3 | 4 | 5;
  morningState: MorningState;
  moodTags: MoodTag[]; // 早晨情绪
  eveningMoodTags?: MoodTag[]; // 前一晚情绪（晚间问卷）
  stressLevel?: 1 | 2 | 3 | 4 | 5;
  caffeine?: Caffeine;
  alcohol?: Alcohol;
  exercise?: Exercise;
  lastScreenTime?: string; // ISO
  napMin?: number;
  note?: string;
  source: "manual" | "watch" | "band";
  createdAt: string;
  updatedAt: string;
}

export interface SleepScore {
  scoreId: string;
  diaryId: string;
  total: number; // 0-100
  durationScore: number;
  efficiencyScore: number;
  latencyScore: number;
  awakeningScore: number;
  subjectiveScore: number;
  regularityScore: number;
  insight: string;
  tier: "wonderful" | "nice" | "okay" | "tough" | "be_kind";
}

export interface PracticeSession {
  sessionId: string;
  userId: string;
  type: "breathing" | "meditation" | "pmr" | "story";
  contentId: string;
  startedAt: string;
  durationSec: number;
  completed: boolean;
}

export interface SleepPlan {
  planId: string;
  userId: string;
  templateId: string;
  startedAt: string; // YYYY-MM-DD
  currentDay: number; // 1-21
  status: "active" | "paused" | "completed" | "abandoned";
  weeklyFocus: string[]; // 长度 3
}

export interface PlanTask {
  taskId: string;
  planId: string;
  dayIndex: number; // 1-21
  title: string;
  description: string;
  done: boolean;
  doneAt?: string;
}

export interface Insight {
  insightId: string;
  userId: string;
  date: string; // YYYY-MM-DD
  ruleId: string;
  message: string;
  severity: "info" | "suggest" | "warning";
}

export interface RiskFlag {
  flagId: string;
  userId: string;
  triggeredAt: string;
  ruleId: string;
  level: "mild" | "moderate" | "urgent";
  acknowledged: boolean;
  dismissedAt?: string;
  message: string;
}

/** CBT-I 担忧时间练习记录：把白天的烦心事在固定时段写下、归档 */
export interface WorryEntry {
  worryId: string;
  userId: string;
  date: string; // YYYY-MM-DD
  content: string; // 本地存储，不上传
  archived: boolean;
  archivedAt?: string;
  createdAt: string;
}

/** CBT-I 认知重构练习记录 */
export interface ReframeRecord {
  reframeId: string;
  userId: string;
  date: string;
  originalThought: string; // 用户的原始负面想法（可来自模板或自填）
  templateId?: string; // 若使用了模板，记录其 id
  balancedThought: string; // 替换后的平衡想法
  createdAt: string;
}

export interface AppSettings {
  themeMode: "system" | "dark" | "auto-night";
  autoNightStart: string; // HH:mm
  autoNightEnd: string; // HH:mm
  diaryReminderTime: string; // HH:mm
  bedtimeReminderTime: string; // HH:mm
  diagnosticUploadEnabled: boolean; // 默认 false
  notificationsEnabled: boolean;
  /** 是否启用云端 AI 朗读 */
  cloudTTSEnabled?: boolean;
  /** TTS 引擎：aliyun=阿里云 / edge=Microsoft Edge */
  ttsCloudEngine?: "edge" | "aliyun";
  /** TTS 音色 ID */
  ttsCloudVoice?: string;
}

export interface AppState {
  profile: UserProfile | null;
  diaries: SleepDiary[];
  scores: SleepScore[];
  plans: SleepPlan[];
  planTasks: PlanTask[];
  practices: PracticeSession[];
  insights: Insight[];
  riskFlags: RiskFlag[];
  worries: WorryEntry[];
  reframes: ReframeRecord[];
  /** 收藏的声音 id 列表（按时间倒序） */
  favoriteSounds: string[];
  /** 最近播放的声音 id（最多保留 8 条，按时间倒序） */
  recentSounds: string[];
  settings: AppSettings;
}

export const DEFAULT_SETTINGS: AppSettings = {
  themeMode: "auto-night",
  autoNightStart: "21:00",
  autoNightEnd: "07:00",
  diaryReminderTime: "08:30",
  bedtimeReminderTime: "22:30",
  diagnosticUploadEnabled: false,
  notificationsEnabled: false,
};
