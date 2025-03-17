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
  const [filter, setFilter] = useState<'ALL' | 'PROFILE' | 'PROXY'>('ALL')

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

  const filteredProducts = filter === 'ALL' 
    ? products 
    : products.filter(product => product.type === filter)

  if (loading) return <div>Carregando...</div>

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Gerenciar Produtos</h1>
      
      <div className="mb-4">
        <div className="flex space-x-2">
          <button 
            onClick={() => setFilter('ALL')}
            className={`px-4 py-2 rounded ${filter === 'ALL' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Todos
          </button>
          <button 
            onClick={() => setFilter('PROFILE')}
            className={`px-4 py-2 rounded ${filter === 'PROFILE' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Perfis
          </button>
          <button 
            onClick={() => setFilter('PROXY')}
            className={`px-4 py-2 rounded ${filter === 'PROXY' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Proxies
          </button>
        </div>
      </div>
      
      <div className="grid gap-4">
        {filteredProducts.map((product) => (
          <div 
            key={product.id} 
            className="bg-white p-4 rounded-lg shadow flex justify-between items-center"
          >
            <div>
              <h2 className="text-xl font-semibold">{product.name}</h2>
              <p className="text-gray-600">{product.description}</p>
              <p className="text-sm text-gray-500">
                Tipo: {product.type}
              </p>
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
              
              {/* Remova a condição para mostrar o link de gerenciar estoque apenas para perfis */}
              <Link
                href={`/admin/products/stock/${product.id}`}
                className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
              >
                Gerenciar Estoque
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
