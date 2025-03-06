'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import type { Order as PrismaOrder } from '.prisma/client'

interface Product {
  id: number
  name: string
  type: string
}

interface OrderItem {
  id: number
  product: Product
}

interface OrderWithItems extends PrismaOrder {
  orderItems: OrderItem[]
}

export default function Dashboard() {
  const { data: session } = useSession()
  const router = useRouter()
  const [orders, setOrders] = useState<OrderWithItems[]>([])
  const [loading, setLoading] = useState(true)
  const handleDownload = async (orderItemId: number) => {
    try {
      const response = await fetch(`/api/download/${orderItemId}`)
      if (!response.ok) throw new Error('Erro ao baixar arquivo')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `profile-${orderItemId}.txt`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Erro ao baixar arquivo:', error)
    }
  }

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


                {order.orderItems && order.orderItems.map((item) => (
                  <div key={item.id} className="mt-2">
                    <p>{item.product.name}</p>
                    {item.product.type === 'PROFILE' && (
                      <button
                        onClick={() => handleDownload(item.id)}
                        className="mt-2 bg-red-700 text-white px-4 py-2 rounded text-sm hover:bg-red-800"
                      >
                        Download Perfil
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
