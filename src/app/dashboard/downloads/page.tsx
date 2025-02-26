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

  if (loading) return <div>Carregando...</div>
  if (error) return <div className="text-red-600">{error}</div>
  if (!order) return <div>Pedido não encontrado</div>

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Downloads Disponíveis</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">
          Pedido #{order.id} - {new Date(order.createdAt).toLocaleDateString()}
        </h2>

        <div className="space-y-4">
          {order.orderItems.map(item => (
            <div key={item.id} className="border p-4 rounded">
              <h3 className="font-semibold">{item.product.name}</h3>
              {item.product.type === 'PROFILE' && (
                <button
                  onClick={() => window.open(item.downloadUrl || '#', '_blank')}
                  className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Download do Perfil
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-blue-600 hover:underline"
          >
            Voltar para Minha Conta
          </button>
        </div>
      </div>
    </div>
  )
} 