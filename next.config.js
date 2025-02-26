/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['images.unsplash.com'], // Adiciona o domínio do Unsplash
  },
}

module.exports = nextConfig
