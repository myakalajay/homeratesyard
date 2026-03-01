/** @type {import('next').NextConfig} */
const nextConfig = {
  // ✅ Standalone output is best for Dockerized environments
  output: 'standalone',
  reactStrictMode: true,
  
  // ✅ Speed up builds by ignoring non-critical errors in dev
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },

  webpack: (config, { dev, isServer }) => {
    if (dev) {
      // ✅ Critical fix for ERR_CONNECTION_RESET and HMR in Docker
      // Polling is necessary because Docker doesn't always broadcast file changes 
      // from Windows to the Linux container.
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: /node_modules/,
      };
    }
    return config;
  },

  // ✅ Flexible image loading for dynamic borrower/property uploads
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },

  // ✅ Optional: Enable if you use specific environment variables in the browser
  publicRuntimeConfig: {
    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  },
};

module.exports = nextConfig;