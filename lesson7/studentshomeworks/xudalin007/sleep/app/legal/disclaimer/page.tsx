export default function DisclaimerPage() {
  return (
    <article className="px-5 pt-10 pb-12 space-y-4 leading-relaxed">
      <h1 className="text-2xl font-medium">医疗免责声明</h1>
      <p>
        「安眠岛 · Hush」是一款<strong>生活方式工具</strong>，不属于医疗器械，
        不能用于诊断、治疗或预防任何疾病。
      </p>
      <p>
        应用中的所有建议、洞察、计划，均基于公开的睡眠卫生原则与认知行为疗法（CBT-I）思路整理，
        仅作为生活方式参考，不能替代医生、临床心理师或睡眠专科的诊疗。
      </p>
      <p>
        如果你出现以下情况之一，请尽快前往医院睡眠科 / 精神心理科或专业医师就诊：
      </p>
      <ul className="list-disc pl-5 space-y-1.5">
        <li>持续 3 个月以上的失眠，并伴随严重日间功能损害</li>
        <li>严重情绪低落、持续焦虑或自伤念头</li>
        <li>打鼾伴随憋醒、白天严重嗜睡（疑似睡眠呼吸暂停）</li>
        <li>已经使用助眠药物且需要调整方案</li>
        <li>怀孕、哺乳期或患有其他慢性疾病期间</li>
      </ul>
      <p>
        本应用<strong>不会</strong>为你输出诊断结论，也不会就处方药、剂量、停药等给出指导。
        任何与药物相关的决定请与医生沟通。
      </p>
      <p className="text-sm text-ink-400 dark:text-ink-300 pt-4">
        最后更新：2026-05-10
      </p>
    </article>
  );
}
