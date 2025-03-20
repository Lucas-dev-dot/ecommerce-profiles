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
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0e0122] to-[#11052c] flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0e0122] to-[#11052c] py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 text-white">Minha Conta</h1>
        <div className="w-24 h-1 bg-[#2c2979] mb-8"></div>

        <div className="bg-[#161243] rounded-lg shadow-lg p-6 mb-8 border border-[#2c2979]/30">
          <h2 className="text-xl font-semibold mb-4 text-white">Informações da Conta</h2>
          <p className="text-gray-300"><strong className="text-white">Nome:</strong> {session?.user?.name}</p>
          <p className="text-gray-300"><strong className="text-white">Email:</strong> {session?.user?.email}</p>
        </div>

        <div className="bg-[#161243] rounded-lg shadow-lg p-6 border border-[#2c2979]/30">
          <h2 className="text-xl font-semibold mb-4 text-white">Meus Pedidos</h2>
          {orders.length === 0 ? (
            <p className="text-gray-300">Nenhum pedido encontrado.</p>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="border border-[#2c2979]/30 p-4 rounded bg-[#11052c]">
                  <p className="text-gray-300"><strong className="text-white">Pedido #:</strong> {order.id}</p>
                  <p className="text-gray-300"><strong className="text-white">Data:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
                  <p className="text-gray-300"><strong className="text-white">Valor:</strong> R$ {Number(order.totalAmount).toFixed(2)}</p>
                  <p className="text-gray-300"><strong className="text-white">Status:</strong> {order.status}</p>

                  {order.orderItems && order.orderItems.map((item) => (
                    <div key={item.id} className="mt-2 p-2 border-t border-[#2c2979]/20">
                      <p className="text-white">{item.product.name}</p>
                      {item.product.type === 'PROFILE' && (
                        <button
                          onClick={() => handleDownload(item.id)}
                          className="mt-2 bg-[#2c2979] text-white px-4 py-2 rounded text-sm hover:bg-[#2c2979]/80 transition-colors"
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
    </div>
  )
}
