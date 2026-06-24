import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  transpilePackages: ['@airlytics/types'],
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
