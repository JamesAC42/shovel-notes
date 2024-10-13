/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:5015/:path*',
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  // Add this configuration
  webpack: (config, { isServer }) => {
    config.resolve.fallback = { fs: false };
    config.resolve.symlinks = false;
    return config;
  },
};

export default nextConfig;