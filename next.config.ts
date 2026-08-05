import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
  // Match Jigsaw's reference Next app so the published package is compiled by Next.
  transpilePackages: ['@jigsaw-ds/design-system'],
  experimental: {
    // Prefer Phosphor ESM named exports when the design-system (or app) pulls icons.
    optimizePackageImports: ['@phosphor-icons/react'],
  },
  webpack: (config) => {
    // Prefer Phosphor's "import" (ESM) condition — its "require" targets still
    // point at the broken root CJS barrel (JSW-114 / jigsaw using-jigsaw.md).
    const conditions = config.resolve.conditionNames ?? [
      'browser',
      'module',
      'require',
      'default',
    ];
    config.resolve.conditionNames = [
      'import',
      ...conditions.filter((c: string) => c !== 'import'),
    ];
    return config;
  },
};

export default nextConfig;
