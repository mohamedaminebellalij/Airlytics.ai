/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  transpilePackages: ['@airlytics/types'],
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
