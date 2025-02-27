'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Product {
  id: number
  name: string
  description: string
  price: any
  type: 'PROFILE' | 'PROXY'
  _count?: {
    stock: number
  }
}

export default function ManageProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      const response = await fetch('/api/admin/products')
      if (!response.ok) throw new Error('Erro ao carregar produtos')
      const data = await response.json()
      setProducts(data)
    } catch (error) {
      console.error('Erro:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Carregando...</div>

  return (
    <div className="container mx-auto p-4">
      
      <div className="grid gap-4">
        {products.map((product) => (
          <div 
            key={product.id} 
            className="bg-white p-4 rounded-lg shadow flex justify-between items-center"
          >
            <div>
              <h2 className="text-xl font-semibold">{product.name}</h2>
              <p className="text-gray-600">{product.description}</p>
              <p className="text-sm text-gray-500">
                Estoque: {product._count?.stock || 0}
              </p>
            </div>
            
            <div className="flex gap-2">
              <Link
                href={`/admin/products/edit/${product.id}`}
                className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
              >
                Editar
              </Link>
              
              {product.type === 'PROFILE' && (
                <Link
                  href={`/admin/products/stock/${product.id}`}
                  className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                >
                  Gerenciar Estoque
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 