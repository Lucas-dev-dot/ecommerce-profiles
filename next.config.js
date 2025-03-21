/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  swcMinify: true,
  // Desabilitar a pré-renderização estática para páginas problemáticas
  experimental: {
    // Isso é para Next.js 14+
    missingSuspenseWithCSRBailout: false,
  },

  unstable_runtimeJS: {
    '/add-balance': true,
    '/checkout': true,
    '/dashboard/downloads': true,
  },


  images: {
    domains: ['images.unsplash.com', 'images.pexels.com', 'via.placeholder.com'], // Adicione 'via.placeholder.com' aqui
  },
}

export default nextConfig
