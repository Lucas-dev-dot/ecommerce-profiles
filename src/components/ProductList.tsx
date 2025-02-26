'use client'

import { ProductCard } from './ProductCard'
import type { ProductType } from '@prisma/client/edge'
import { useEffect, useState } from 'react'

interface Product {
  id: number
  name: string
  description: string
  price: any
  type: ProductType
  imageUrl?: string
  profileFile?: string | null
  stock?: number
  createdAt?: Date
  _count?: {
    stock: number
  }
}

interface ProductListProps {
  products: Product[]
}

export default function ProductList({ products }: ProductListProps) {
  const [isClient, setIsClient] = useState(false)
  
  console.log('=== ProductList Render ===')
  console.log('Todos os produtos:', products)
  console.log('Quantidade total:', products.length)
  
  useEffect(() => {
    setIsClient(true)
  }, [])
  
  if (!isClient) {
    return <div>Carregando produtos...</div>
  }
  
  // Separar produtos por tipo e ordenar por preço
  const profiles = products
    .filter(product => product.type === 'PROFILE')
    .sort((a, b) => Number(a.price) - Number(b.price))
  
  const proxies = products
    .filter(product => product.type === 'PROXY')
    .sort((a, b) => Number(a.price) - Number(b.price))
  
  console.log('Perfis:', profiles.map((p: Product) => ({ id: p.id, type: p.type })))
  console.log('Proxies:', proxies.map((p: Product) => ({ id: p.id, type: p.type })))

  return (
    <div>
      {/* Seção de Perfis */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Perfis ({profiles.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {profiles.map((product) => (
            <ProductCard 
              key={`profile-${product.id}`} 
              product={product}
            />
          ))}
        </div>
        {profiles.length === 0 && (
          <p className="text-gray-500">Nenhum perfil cadastrado.</p>
        )}
      </section>
      
      {/* Seção de Proxies */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Proxies ({proxies.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {proxies.map((product) => (
            <ProductCard 
              key={`proxy-${product.id}`} 
              product={product}
            />
          ))}
        </div>
        {proxies.length === 0 && (
          <p className="text-gray-500">Nenhum proxy cadastrado.</p>
        )}
      </section>
    </div>
  )
} 