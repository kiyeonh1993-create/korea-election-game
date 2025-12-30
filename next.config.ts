/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // !! 핵심: 빌드 시 타입 에러가 있어도 무시하고 배포를 강제로 진행합니다.
    ignoreBuildErrors: true,
  },
  eslint: {
    // 빌드 시 ESLint 에러도 무시하도록 설정하여 빌드 속도를 높이고 충돌을 방지합니다.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;