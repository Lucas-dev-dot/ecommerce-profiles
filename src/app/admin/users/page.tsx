'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

interface Product {
  id: number
  name: string
  price: number
  type: string
}

interface OrderItem {
  id: number
  quantity: number
  price: number
  product: Product
}

interface Order {
  id: number
  createdAt: string
  totalAmount: number
  status: string
  orderItems: OrderItem[]
}

interface User {
  id: number
  name: string
  email: string
  balance: number
  createdAt: string
  orders: Order[]
  products: Product[]
}

export default function AdminUsers() {
  const { data: session } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  useEffect(() => {
    if (!session?.user?.isAdmin) {
      router.push('/')
      return
    }

    loadUsers()
  }, [session, router])

  async function loadUsers() {
    try {
      const response = await fetch('/api/admin/users')
      if (!response.ok) throw new Error('Erro ao carregar usuários')
      const data = await response.json()
      setUsers(data)
    } catch (error) {
      setError('Erro ao carregar usuários')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-xl font-semibold mb-2">Carregando...</div>
          <div className="text-gray-500">Aguarde enquanto carregamos os dados</div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gerenciar Usuários</h1>
        <button
          onClick={() => router.push('/admin')}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          Voltar
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lista de Usuários */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Usuários</h2>
          <div className="space-y-4">
            {users.map((user) => (
              <div
                key={user.id}
                className={`border p-4 rounded cursor-pointer transition-colors ${
                  selectedUser?.id === user.id
                    ? 'bg-blue-50 border-blue-500'
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => setSelectedUser(user)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">{user.email}</h3>
                    <p className="text-sm text-gray-600">
                      Saldo: R$ {Number(user.balance).toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600">
                      Pedidos: {user.orders.length}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detalhes do Usuário */}
        {selectedUser && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">
              Detalhes: {selectedUser.email}
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Informações Gerais</h3>
                <p>Data de cadastro: {new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                <p>Saldo atual: R$ {Number(selectedUser.balance).toFixed(2)}</p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Perfis Comprados</h3>
                {selectedUser.products.length > 0 ? (
                  <ul className="space-y-2">
                    {selectedUser.products
                      .filter(product => product.type === 'PROFILE')
                      .map(product => (
                        <li key={product.id} className="border p-2 rounded">
                          {product.name} - R$ {Number(product.price).toFixed(2)}
                        </li>
                      ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">Nenhum perfil comprado</p>
                )}
              </div>

              <div>
                <h3 className="font-semibold mb-2">Histórico de Pedidos</h3>
                {selectedUser.orders.length > 0 ? (
                  <div className="space-y-4">
                    {selectedUser.orders.map(order => (
                      <div key={order.id} className="border p-3 rounded">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">
                            Pedido #{order.id}
                          </span>
                          <span className="text-sm text-gray-600">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <ul className="space-y-1">
                          {order.orderItems.map(item => (
                            <li key={item.id} className="text-sm">
                              {item.product.name} x{item.quantity} - 
                              R$ {Number(item.price).toFixed(2)}
                            </li>
                          ))}
                        </ul>
                        <div className="mt-2 text-right font-medium">
                          Total: R$ {Number(order.totalAmount).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Nenhum pedido realizado</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 