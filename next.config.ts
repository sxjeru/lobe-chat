import { defineConfig } from './src/libs/next/config/define-config';

const nextConfig = defineConfig({
  eslint: {
    ignoreDuringBuilds: true,
  },

  experimental: {
    webpackBuildWorker: true,
    webpackMemoryOptimizations: true,
  },

  webpack: (config, { dev }) => {
    if (!dev) {
        config.cache = false;
    }
    return config;
  },
});

export default nextConfig;
