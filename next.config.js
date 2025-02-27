/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['images.unsplash.com', 'images.pexels.com', 'via.placeholder.com'], // Adicione 'via.placeholder.com' aqui
  },
}

export default nextConfig
