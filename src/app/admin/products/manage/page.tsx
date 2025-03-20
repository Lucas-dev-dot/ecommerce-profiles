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

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-b from-[#0e0122] to-[#11052c] flex items-center justify-center">
      <div className="text-white text-xl">Carregando...</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0e0122] to-[#11052c] py-8">
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-2 text-white">Gerenciar Produtos</h1>
        <div className="w-32 h-1 bg-[#2c2979] mb-8"></div>
        
        <div className="mb-6">
          <div className="flex space-x-2">
            <button 
              onClick={() => setFilter('ALL')}
              className={`px-4 py-2 rounded transition-colors ${filter === 'ALL' ? 'bg-[#2c2979] text-white' : 'bg-[#161243] text-gray-300 border border-[#2c2979]/30'}`}
            >
              Todos
            </button>
            <button 
              onClick={() => setFilter('PROFILE')}
              className={`px-4 py-2 rounded transition-colors ${filter === 'PROFILE' ? 'bg-[#2c2979] text-white' : 'bg-[#161243] text-gray-300 border border-[#2c2979]/30'}`}
            >
              Perfis
            </button>
            <button 
              onClick={() => setFilter('PROXY')}
              className={`px-4 py-2 rounded transition-colors ${filter === 'PROXY' ? 'bg-[#2c2979] text-white' : 'bg-[#161243] text-gray-300 border border-[#2c2979]/30'}`}
            >
              Proxies
            </button>
          </div>
        </div>
        
        <div className="grid gap-4">
          {filteredProducts.map((product) => (
            <div 
              key={product.id} 
              className="bg-[#161243] p-4 rounded-lg shadow-lg flex justify-between items-center border border-[#2c2979]/30"
            >
              <div>
                <h2 className="text-xl font-semibold text-white">{product.name}</h2>
                <p className="text-gray-300">{product.description}</p>
                <p className="text-sm text-gray-400">
                  Tipo: {product.type}
                </p>
                <p className="text-sm text-gray-400">
                  Estoque: {product._count?.stock || 0}
                </p>
              </div>
              
              <div className="flex gap-2">
                <Link
                  href={`/admin/products/edit/${product.id}`}
                  className="bg-[#2c2979] text-white px-3 py-1 rounded hover:bg-[#2c2979]/80 transition-colors"
                >
                  Editar
                </Link>
                
                <Link
                  href={`/admin/products/stock/${product.id}`}
                  className="bg-[#2c2979] text-white px-3 py-1 rounded hover:bg-[#2c2979]/80 transition-colors"
                >
                  Gerenciar Estoque
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
