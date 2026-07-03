export default function TermsPage() {
  return (
    <article className="px-5 pt-10 pb-12 space-y-4 leading-relaxed">
      <h1 className="text-2xl font-medium">服务协议（原型版）</h1>
      <p>
        本应用为产品原型，旨在演示睡眠改善助手的核心功能。在使用本应用前请确保你已阅读并同意以下条款：
      </p>
      <ul className="list-disc pl-5 space-y-1.5">
        <li>本应用是<strong>生活方式工具</strong>，不能替代医生或医疗服务。</li>
        <li>不承诺特定的睡眠改善效果。每个人的情况不同，请结合自身实际判断。</li>
        <li>原型阶段未经医疗合规专业审查，建议仅作为产品功能与设计的参考。</li>
        <li>如发现内容存在错误、误导或安全隐患，欢迎向我们反馈。</li>
      </ul>
      <p>
        在正式产品上线前，本协议将与法律 / 合规团队共同复审。
      </p>
      <p className="text-sm text-ink-400 dark:text-ink-300 pt-4">
        最后更新：2026-05-10
      </p>
    </article>
  );
}
