import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: `${process.env.NEXT_PUBLIC_E2_BUCKET_NAME}.${process.env.NEXT_PUBLIC_E2_ENDPOINT}`,
        port: '',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: `${process.env.NEXT_PUBLIC_E2_AVATARS_BUCKET_NAME}.${process.env.NEXT_PUBLIC_E2_ENDPOINT}`,
        port: '',
        pathname: '/**'
      }
    ]
  }
};

export default nextConfig;
