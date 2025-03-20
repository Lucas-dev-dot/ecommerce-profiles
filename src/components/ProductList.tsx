'use client'

import { ProductCard } from './ProductCard'
import type { product_type } from '@prisma/client/edge'
import { useEffect, useState } from 'react'

interface Product {
  id: number
  name: string
  description: string
  price: any
  type: product_type
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
  showProxies?: boolean // Adicione esta prop para controlar se mostra proxies
  showProfiles?: boolean // Adicione esta prop para controlar se mostra perfis
}

export default function ProductList({
  products,
  showProxies = true,
  showProfiles = true
}: ProductListProps) {
  const [isClient, setIsClient] = useState(false)
 
  console.log('=== ProductList Render ===')
  console.log('Todos os produtos:', products)
  console.log('Quantidade total:', products.length)
 
  useEffect(() => {
    setIsClient(true)
  }, [])
 
  if (!isClient) {
    return <div className="text-white text-center py-8">Carregando produtos...</div>
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
    <div className="bg-gradient-to-b from-[#0e0122] to-[#11052c] text-white">
      {/* Seção de Perfis */}
      {showProfiles && (
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-white relative">
            Perfis
            <div className="w-20 h-1 bg-[#2c2979] mt-2"></div>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profiles.length > 0 ? (
              profiles.map((product) => (
                <ProductCard
                  key={`profile-${product.id}`}
                  product={{
                    ...product,
                    id: product.id.toString(),
                    price: Number(product.price)
                  }}
                />
              ))
            ) : (
              <p className="text-gray-300 col-span-3">Nenhum perfil cadastrado.</p>
            )}
          </div>
        </section>
      )}
     
      {/* Seção de Proxies */}
      {showProxies && (
        <section>
          <h2 className="text-3xl font-bold mb-6 text-white relative">
            Proxies
            <div className="w-20 h-1 bg-[#2c2979] mt-2"></div>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {proxies.length > 0 ? (
              proxies.map((product) => (
                <ProductCard
                  key={`proxy-${product.id}`}
                  product={{
                    ...product,
                    id: product.id.toString(),
                    price: Number(product.price)
                  }}
                />
              ))
            ) : (
              <p className="text-gray-300 col-span-3">Nenhum proxy cadastrado.</p>
            )}
          </div>
        </section>
      )}
    </div>
  )
}
