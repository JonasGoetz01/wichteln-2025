/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.intra.42.fr',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'profile.intra.42.fr',
        port: '',
        pathname: '/**',
      }
    ],
  },
}

module.exports = nextConfig 