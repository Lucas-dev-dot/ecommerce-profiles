'use client'

import { useEffect, useState } from 'react'
import { useCart } from '@/contexts/CartContext'
import { Product as PrismaProduct, product_type } from '@prisma/client/edge'
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
          setError(error.message) // Acesse o `message` do erro
        } else {
          setError('Erro desconhecido') // Caso o erro não seja do tipo `Error`
        }
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [])

  if (loading) return <div>Carregando...</div>
  if (error) return <div>{error}</div>

  return (
    <div className="space-y-12">
      <section>
        <h2 className="text-2xl font-semibold mb-6">Perfis</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={{
                id: product.id,
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
        <h2 className="text-2xl font-semibold mb-6">Proxies</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={{
                id: product.id,
                name: product.name,
                price: product.price,
                description: product.description,
                type: product_type.PROXY,
              }}
            />
          ))}
        </div>
      </section>
    </div>
  )
}
