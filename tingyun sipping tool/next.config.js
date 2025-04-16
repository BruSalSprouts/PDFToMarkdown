/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Needed for Electron integration
  output: 'export',
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig