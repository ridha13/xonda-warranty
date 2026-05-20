/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable typescript and eslint checks during build
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
