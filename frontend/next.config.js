/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['your-backend-domain.com'], // Add your backend domain here
  },
  // Enable static exports for single-page applications
  output: 'export',
  // Optional: Add a trailing slash to all paths
  trailingSlash: true,
  // Optional: Change the output directory `out` -> `build`
  distDir: 'build',
}

module.exports = nextConfig
