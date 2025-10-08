import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Performance optimizations
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react'],
  },

  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },

  // PWA and caching
  async rewrites() {
    return [
      {
        source: '/sw.js',
        destination: '/_next/static/sw.js',
      },
    ];
  },

  // Bundle analyzer (only in development)
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config: any) => {
      if (process.env.ANALYZE === 'true') {
        const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
        config.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'server',
            analyzerPort: 8888,
            openAnalyzer: true,
          })
        );
      }
      return config;
    },
  }),

  // Output configuration for static export (if needed)
  ...(process.env.BUILD_STANDALONE === 'true' && {
    output: 'standalone',
  }),

  // Redirects for SEO
  async redirects() {
    return [
      // Prefer /dashboard over legacy /home
      {
        source: '/home',
        destination: '/dashboard',
        permanent: true,
      },
      // Map old section names to new paths
      {
        source: '/home/waterIntake',
        destination: '/dashboard/water',
        permanent: true,
      },
      {
        source: '/home/foodIntake',
        destination: '/dashboard/food',
        permanent: true,
      },
      {
        source: '/home/workout',
        destination: '/dashboard/workout',
        permanent: true,
      },
      {
        source: '/home/profile',
        destination: '/dashboard/profile',
        permanent: true,
      },
      {
        source: '/home/health-score',
        destination: '/dashboard',
        permanent: true,
      },
      {
        source: '/home/:path*',
        destination: '/dashboard/:path*',
        permanent: true,
      },
      // Legacy auth shortcuts -> dashboard
      {
        source: '/login',
        destination: '/dashboard',
        permanent: true,
      },
      {
        source: '/register',
        destination: '/dashboard',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
