import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@airlytics/types'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'flagcdn.com' },
    ],
  },
};

export default nextConfig;
