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
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0e0122] to-[#11052c] flex items-center justify-center">
        <div className="text-white text-xl">Carregando usuários...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0e0122] to-[#11052c] py-8">
      <div className="max-w-7xl mx-auto p-4">
        <h1 className="text-3xl font-bold mb-2 text-white">Gerenciar Usuários</h1>
        <div className="w-32 h-1 bg-[#2c2979] mb-8"></div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map(user => (
            <div key={user.id} className="border border-[#2c2979]/30 rounded-lg p-4 shadow-lg bg-[#161243]">
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-white">{user.name}</h2>
                <p className="text-gray-300">{user.email}</p>
                <p className="text-sm text-gray-300">
                  Saldo: <span className="text-white font-semibold">R$ {Number(user.balance).toFixed(2)}</span>
                </p>
                <p className="text-sm text-gray-300">
                  Pedidos: <span className="text-white font-semibold">{user._count.orders}</span>
                </p>
                
                <div className="pt-4 flex space-x-2">
                  <Link 
                    href={`/admin/users/edit/${user.id}`}
                    className="bg-[#2c2979] text-white px-3 py-1 rounded hover:bg-[#2c2979]/80 text-sm transition-colors"
                  >
                    Editar Usuário
                  </Link>
                  <Link 
                    href={`/admin/users/balance/${user.id}`}
                    className="bg-[#2c2979] text-white px-3 py-1 rounded hover:bg-[#2c2979]/80 text-sm transition-colors"
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
            className="bg-[#161243] text-white px-4 py-2 rounded hover:bg-[#161243]/80 border border-[#2c2979]/30 transition-colors"
          >
            Voltar
          </button>
        </div>
      </div>
    </div>
  )
}
