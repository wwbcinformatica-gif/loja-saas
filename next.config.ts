import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'salao-saas-ten.vercel.app',
          },
        ],
        destination: 'https://loja-saas-ten.vercel.app/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
