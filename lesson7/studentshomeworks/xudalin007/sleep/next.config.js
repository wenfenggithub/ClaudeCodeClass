/** @type {import('next').NextConfig} */
//
// 默认走 server 模式（支持 /api/tts 与 /api/auth、/api/admin 路由）
// 想生成纯静态 out/ 目录用于离线分发，设置 STATIC_EXPORT=1 即可：
//   STATIC_EXPORT=1 npm run build
// （静态导出会移除所有 API 路由；云 TTS、账户注册/登录、管理员功能在该模式下均不可用）
const STATIC_EXPORT = process.env.STATIC_EXPORT === "1";

const nextConfig = {
  reactStrictMode: true,
  trailingSlash: true,
  images: { unoptimized: true },
  ...(STATIC_EXPORT ? { output: "export" } : {}),
};

module.exports = nextConfig;
