/** @type {import('next').NextConfig} */
const webpack = require('webpack')
const path = require('path')

const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    // Exclude problematic dependencies
    config.externals.push('pino-pretty', 'lokijs', 'encoding')
    
    // Handle React Native dependencies in browser build
    if (!isServer) {
      // Alias React Native async-storage to our browser mock
      config.resolve.alias = {
        ...config.resolve.alias,
        '@react-native-async-storage/async-storage': path.resolve(__dirname, 'src/lib/mocks/async-storage.ts'),
      }
      
      // Fallback for React Native modules
      config.resolve.fallback = {
        ...config.resolve.fallback,
        'react-native': false,
      }
    }
    
    return config
  },
};

module.exports = nextConfig;
