/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '',
  async rewrites() {
    return [
      {
        source: '/flashcards/api/:path*',
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
  webpack: (config, { isServer }) => {
    config.resolve.fallback = { fs: false };
    config.resolve.symlinks = false;
    return config;
  },
};

export default nextConfig;