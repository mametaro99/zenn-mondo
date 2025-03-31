/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // ESLintチェックを無効化
    ignoreDuringBuilds: true,
  },
  typescript: {
    // 型チェックを無効化
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
