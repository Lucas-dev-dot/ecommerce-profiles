'use client'

import { useEffect, useState } from 'react'
import { useCart } from '@/src/contexts/CartContext'
import type { Product } from '@prisma/client/edge'
import { ProductCard } from '@/src/components/ProductCard'

export default function Products() {
  const [profiles, setProfiles] = useState<Product[]>([])
  const [proxies, setProxies] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { addItem } = useCart()

  useEffect(() => {
    loadProducts()
  }, [])

  async function loadProducts() {
    try {
      setLoading(true)
      setError('')

      // Carregar perfis e proxies em paralelo
      const [profilesResponse, proxiesResponse] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/admin/proxies')
      ])

      if (!profilesResponse.ok || !proxiesResponse.ok) {
        throw new Error('Erro ao carregar produtos')
      }

      const profilesData = await profilesResponse.json()
      const proxiesData = await proxiesResponse.json()

      setProfiles(profilesData)
      setProxies(proxiesData)
    } catch (error) {
      console.error('Erro:', error)
      setError('Erro ao carregar produtos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-12">
      <section>
        <h2 className="text-2xl font-semibold mb-6">Perfis</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {profiles.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-6">Proxies</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {proxies.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>
      </section>
    </div>
  )
} 