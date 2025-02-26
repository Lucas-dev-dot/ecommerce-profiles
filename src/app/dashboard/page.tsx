'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import type { Order } from '.prisma/client'

export default function Dashboard() {
  const { data: session } = useSession()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session) {
      router.push('/login')
      return
    }

    async function loadOrders() {
      try {
        const response = await fetch('/api/orders')
        const data = await response.json()
        setOrders(data)
      } catch (error) {
        console.error('Erro ao carregar pedidos:', error)
      } finally {
        setLoading(false)
      }
    }

    loadOrders()
  }, [session, router])

  if (loading) {
    return <div>Carregando...</div>
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Minha Conta</h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Informações da Conta</h2>
        <p><strong>Nome:</strong> {session?.user?.name}</p>
        <p><strong>Email:</strong> {session?.user?.email}</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Meus Pedidos</h2>
        {orders.length === 0 ? (
          <p>Nenhum pedido encontrado.</p>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="border p-4 rounded">
                <p><strong>Pedido #:</strong> {order.id}</p>
                <p><strong>Data:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
                <p><strong>Valor:</strong> R$ {Number(order.totalAmount).toFixed(2)}</p>
                <p><strong>Status:</strong> {order.status}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 