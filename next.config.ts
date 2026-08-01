import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
  // Match Jigsaw's reference Next app so the published package is compiled by Next.
  transpilePackages: ['@jigsaw-ds/design-system'],
};

export default nextConfig;
