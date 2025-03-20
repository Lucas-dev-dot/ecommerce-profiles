'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

interface OrderItem {
  id: number
  product: {
    id: number
    name: string
    type: string
  }
  downloadUrl?: string
}

interface Order {
  id: number
  orderItems: OrderItem[]
  status: string
  createdAt: string
}

export default function Downloads() {
  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get('order')
 
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!session) {
      router.push('/login')
      return
    }

    async function loadOrder() {
      try {
        const response = await fetch(`/api/orders/${orderId}`)
        if (!response.ok) throw new Error('Erro ao carregar pedido')
        const data = await response.json()
        setOrder(data)
      } catch (error) {
        setError('Erro ao carregar informações do pedido')
      } finally {
        setLoading(false)
      }
    }

    if (orderId) {
      loadOrder()
    }
  }, [session, orderId, router])

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-b from-[#0e0122] to-[#11052c] flex items-center justify-center">
      <div className="text-white text-xl">Carregando...</div>
    </div>
  )
  
  if (error) return (
    <div className="min-h-screen bg-gradient-to-b from-[#0e0122] to-[#11052c] flex items-center justify-center">
      <div className="text-red-300 bg-red-900/20 p-4 rounded">{error}</div>
    </div>
  )
  
  if (!order) return (
    <div className="min-h-screen bg-gradient-to-b from-[#0e0122] to-[#11052c] flex items-center justify-center">
      <div className="text-white text-xl">Pedido não encontrado</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0e0122] to-[#11052c] py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6 text-white">Downloads Disponíveis</h1>
        <div className="w-24 h-1 bg-[#2c2979] mb-8"></div>
       
        <div className="bg-[#161243] rounded-lg shadow-lg p-6 border border-[#2c2979]/30">
          <h2 className="text-xl font-semibold mb-4 text-white">
            Pedido #{order.id} - {new Date(order.createdAt).toLocaleDateString()}
          </h2>

          <div className="space-y-4">
            {order.orderItems.map(item => (
              <div key={item.id} className="border border-[#2c2979]/30 p-4 rounded bg-[#11052c]">
                <h3 className="font-semibold text-white">{item.product.name}</h3>
                <p className="text-sm text-gray-300 mb-2">
                  Tipo: {item.product.type === 'PROFILE' ? 'Perfil' : 'Proxy'}
                </p>
                
                {(item.product.type === 'PROFILE' || item.product.type === 'PROXY') && (
                  <button
                    onClick={() => window.open(`/api/downloads/${item.id}`, '_blank')}
                    className="mt-2 bg-[#2c2979] text-white px-4 py-2 rounded hover:bg-[#2c2979]/80 transition-colors"
                  >
                    Download do {item.product.type === 'PROFILE' ? 'Perfil' : 'Proxy'}
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-[#2c2979] hover:text-[#2c2979]/80 transition-colors"
            >
              Voltar para Minha Conta
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
