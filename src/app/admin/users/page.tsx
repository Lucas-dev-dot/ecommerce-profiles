'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface User {
  id: number
  name: string
  email: string
  balance: number
  createdAt: string
  _count: {
    orders: number
  }
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    setLoading(true)
    fetch('/api/admin/users')
      .then(res => res.json())
      .then(data => {
        setUsers(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Erro ao carregar usuários:', err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return <div className="p-4 text-center">Carregando usuários...</div>
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Gerenciar Usuários</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map(user => (
          <div key={user.id} className="border rounded-lg p-4 shadow bg-white">
            <div className="space-y-2">
              <h2 className="text-xl font-bold">{user.name}</h2>
              <p className="text-gray-600">{user.email}</p>
              <p className="text-sm text-gray-600">
                Saldo: R$ {Number(user.balance).toFixed(2)}
              </p>
              <p className="text-sm text-gray-600">
                Pedidos: {user._count.orders}
              </p>
              
              <div className="pt-4 flex space-x-2">
                <Link 
                  href={`/admin/users/edit/${user.id}`}
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm"
                >
                  Editar Usuário
                </Link>
                <Link 
                  href={`/admin/users/balance/${user.id}`}
                  className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 text-sm"
                >
                  Ajustar Saldo
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6">
        <button
          onClick={() => router.push('/admin')}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Voltar
        </button>
      </div>
    </div>
  )
}
