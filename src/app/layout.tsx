import './globals.css'
import { Inter } from 'next/font/google'
import Header from '../components/Header'
import { Providers } from '../components/Providers'
import WhatsAppButton from '@/components/WhatsAppButton'
import { Metadata } from 'next'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Vision Contigência',
  description: 'Descrição do seu e-commerce',
  icons: {
    icon: '/favicon.ico',
    // For multiple sizes you can add:
    // apple: '/apple-icon.png',
    // shortcut: '/favicon-16x16.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-gradient-to-b from-[#0e0122] to-[#11052c] min-h-screen`}>
        <Providers>
          <Header />
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
          <WhatsAppButton />
        </Providers>
      </body>
    </html>
  )
}
