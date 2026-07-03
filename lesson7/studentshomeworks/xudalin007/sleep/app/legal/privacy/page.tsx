export default function PrivacyPage() {
  return (
    <article className="px-5 pt-10 pb-12 space-y-4 leading-relaxed">
      <h1 className="text-2xl font-medium">隐私政策（原型版）</h1>
      <p>我们认为睡眠数据是高度敏感的个人信息。本原型遵循以下原则：</p>
      <h2 className="text-lg font-medium pt-2">本地优先</h2>
      <p>
        所有睡眠日记、备注、计划、风险标记<strong>默认仅存储在你的设备上</strong>
        （浏览器本地数据库）。除非你主动开启同步，否则不会上传到任何服务器。
      </p>
      <h2 className="text-lg font-medium pt-2">关键词识别在端侧完成</h2>
      <p>
        当你的备注中出现自伤 / 自杀相关关键词时，系统会立即在本地识别并展示心理援助资源。
        识别过程<strong>不上传任何文本</strong>。
      </p>
      <h2 className="text-lg font-medium pt-2">不收集敏感生理数据</h2>
      <p>
        本原型不接入手环、手表，也不读取麦克风、加速度计。
        你看到的所有数据都来自你的主动输入。
      </p>
      <h2 className="text-lg font-medium pt-2">不打广告，不卖数据</h2>
      <p>不集成第三方广告 SDK，不向第三方出售或分享你的数据。</p>
      <h2 className="text-lg font-medium pt-2">你的控制权</h2>
      <p>
        你可以在设置 → 数据中：随时导出数据为 JSON / 一键清空全部数据。
      </p>
      <p className="text-sm text-ink-400 dark:text-ink-300 pt-4">
        最后更新：2026-05-10
      </p>
    </article>
  );
}
