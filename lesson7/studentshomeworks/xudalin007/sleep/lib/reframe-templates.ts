// 睡眠相关常见负面想法 + 平衡替换建议（spec.md 4.8）
// 平衡想法仅作为引导提示，最终采纳的内容由用户自己改写或确认。

export interface ReframeTemplate {
  id: string;
  category: "catastrophe" | "rigidity" | "self_blame" | "fortune_telling" | "all_or_nothing";
  original: string;
  // 给出"温和的提问"而非直接结论，更符合 CBT-I 的苏格拉底式提问思路
  prompts: string[];
  // 一个可选的"参考替换文案"，鼓励用户用自己的话改写
  suggested: string;
}

export const REFRAME_TEMPLATES: ReframeTemplate[] = [
  {
    id: "catastrophe_tomorrow",
    category: "catastrophe",
    original: "今晚再睡不着，明天就完蛋了。",
    prompts: [
      "过去你也有过没睡好的日子，结果真的「完蛋」了吗？",
      "明天如果状态一般，有没有可以减轻负担的方式？",
    ],
    suggested:
      "就算睡得不理想，明天我也能想办法过得去。过去很多次没睡好，我也都撑过了。",
  },
  {
    id: "rigidity_8hours",
    category: "rigidity",
    original: "我必须睡满 8 小时，不然身体会垮。",
    prompts: [
      "你的身体每天真的需要完全相同的时长吗？",
      "有没有过睡得少但精神还可以的经历？",
    ],
    suggested:
      "睡眠时长是个范围。今晚睡 6 小时也并不意味着身体会垮，恢复感更重要。",
  },
  {
    id: "fortune_immediate",
    category: "fortune_telling",
    original: "我必须立刻睡着，不然又是一夜白搭。",
    prompts: [
      "「必须立刻睡着」这件事，越急是不是越睡不着？",
      "如果允许自己慢慢来，会发生什么？",
    ],
    suggested:
      "允许自己慢一点。即使现在没睡着，安静地躺着也是在休息。",
  },
  {
    id: "all_or_nothing_never",
    category: "all_or_nothing",
    original: "我从来没睡过一个好觉。",
    prompts: [
      "过去 30 天里，有没有哪怕一晚醒来感觉还不错？",
      "「从来没有」是不是一个绝对化的说法？",
    ],
    suggested:
      "确实有不少难熬的夜晚，但偶尔也有睡得相对好的时候。今晚我可以期待一个还可以的夜晚。",
  },
  {
    id: "self_blame_tired",
    category: "self_blame",
    original: "今天累成这样，都是因为我没睡好。",
    prompts: [
      "今天的疲劳真的只来自睡眠吗？",
      "压力、咖啡因、运动、情绪有没有也在影响？",
    ],
    suggested:
      "疲劳的原因是多方面的，睡眠只是其中之一。我不需要因此再责备自己一次。",
  },
  {
    id: "catastrophe_health",
    category: "catastrophe",
    original: "长期睡不好我一定会得大病。",
    prompts: [
      "你已经做了哪些事在尝试改善？",
      "比起「一定会」，「可能会，所以我正在调整」是不是更接近事实？",
    ],
    suggested:
      "长期睡眠问题确实需要重视，所以我正在记录、调整、必要时寻求帮助。这本身就是在保护身体。",
  },
  {
    id: "fortune_meeting",
    category: "fortune_telling",
    original: "我没睡好，明天的会议肯定搞砸。",
    prompts: [
      "过去状态一般的日子里，你的表现真的差到那种程度吗？",
      "有没有可以提前准备、减轻紧张的事？",
    ],
    suggested:
      "我可能不会处于最好的状态，但准备已经做了，关键内容我能讲清楚。",
  },
  {
    id: "rigidity_lie_in_bed",
    category: "rigidity",
    original: "我必须躺着，就算睡不着也得在床上。",
    prompts: [
      "床和睡眠的联系，会不会因此被「躺很久」削弱？",
      "起身做点无聊的事，等困了再回来，是不是反而更快入睡？",
    ],
    suggested:
      "如果躺 20 分钟还没睡着，可以起身去客厅做点无聊的事。这样反而能保护「床=睡眠」的条件反射。",
  },
];

export function getTemplateById(id: string | undefined) {
  if (!id) return undefined;
  return REFRAME_TEMPLATES.find((t) => t.id === id);
}
