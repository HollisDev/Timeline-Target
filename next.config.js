/** @type {import('next').NextConfig} */
const path = require('path')
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const nextConfig = {
  // Performance optimizations
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  // Prevent Next.js from tracing outside the project root (fixes slow/hanging builds)
  outputFileTracingRoot: path.resolve(__dirname),

  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Enable tree shaking and minification
      config.optimization.minimize = true

      // Split chunks for better caching
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            enforce: true,
          },
        },
      }
    }

    return config
  },
}

let exported = withBundleAnalyzer(nextConfig)

// Only enable Sentry's webpack plugin in production to avoid dev hangs
if (process.env.NODE_ENV === 'production') {
  const { withSentryConfig } = require("@sentry/nextjs")
  exported = withSentryConfig(exported, {
    org: "dev-xq",
    project: "dev",
    silent: !process.env.CI,
    widenClientFileUpload: true,
    tunnelRoute: "/monitoring",
    disableLogger: true,
    automaticVercelMonitors: true,
  })
}

module.exports = exported
