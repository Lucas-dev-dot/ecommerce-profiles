'use client'

import { useEffect, useState } from 'react'
import { useCart } from '@/contexts/CartContext'
import { product_type } from '@prisma/client/edge'
import { ProductCard } from '@/components/ProductCard'

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  type: product_type;
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { addItem } = useCart()

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetch('/api/products')
        if (!response.ok) {
          throw new Error('Erro ao carregar produtos')
        }
        const data = await response.json()
        setProducts(data)
      } catch (error: unknown) {
        if (error instanceof Error) {
          setError(error.message)
        } else {
          setError('Erro desconhecido')
        }
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [])

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-b from-[#0e0122] to-[#11052c] flex items-center justify-center">
      <div className="text-white text-xl">Carregando...</div>
    </div>
  )
  
  if (error) return (
    <div className="min-h-screen bg-gradient-to-b from-[#0e0122] to-[#11052c] flex items-center justify-center">
      <div className="text-red-300 text-xl">{error}</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0e0122] to-[#11052c]">
      <div className="container mx-auto px-4 py-12 space-y-12">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Nossos Produtos</h1>
          <div className="w-24 h-1 bg-[#2c2979] mx-auto mb-6"></div>
        </header>
        
        <section>
          <h2 className="text-2xl font-semibold mb-6 text-white relative">
            Perfis
            <div className="w-20 h-1 bg-[#2c2979] mt-2"></div>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products
              .filter(product => product.type === 'PROFILE')
              .map((product) => (
                <ProductCard
                  key={product.id}
                  product={{
                    id: product.id.toString(),
                    name: product.name,
                    price: product.price,
                    description: product.description,
                    type: product.type,
                  }}
                />
              ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-6 text-white relative">
            Proxies
            <div className="w-20 h-1 bg-[#2c2979] mt-2"></div>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products
              .filter(product => product.type === 'PROXY')
              .map((product) => (
                <ProductCard
                  key={product.id}
                  product={{
                    id: product.id.toString(),
                    name: product.name,
                    price: product.price,
                    description: product.description,
                    type: product.type,
                  }}
                />
              ))}
          </div>
        </section>
      </div>
    </div>
  )
}
