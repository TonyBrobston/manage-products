// @ts-check

/**
 * @type {import('next').NextConfig}
 **/
const nextConfig = {
  output: 'export',
  basePath: '/manage-products',
  experimental: {
    appDir: true,
  },
}

module.exports = nextConfig