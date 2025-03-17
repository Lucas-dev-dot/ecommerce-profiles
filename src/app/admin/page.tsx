'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

interface DashboardStats {
  totalUsers: number
  totalOrders: number
  totalRevenue: number
  totalProfiles: number
}

export default function AdminDashboard() {
  const { data: session } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!session?.user?.isAdmin) {
      router.push('/')
      return
    }

    loadDashboardStats()
  }, [session, router])

  async function loadDashboardStats() {
    try {
      const response = await fetch('/api/admin/dashboard')
      if (!response.ok) throw new Error('Erro ao carregar estatísticas')
      const data = await response.json()
      setStats(data)
    } catch (error) {
      setError('Erro ao carregar estatísticas do dashboard')
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
      <h1 className="text-2xl font-bold mb-6">Painel Administrativo</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-600">Total de Usuários</h3>
          <p className="text-3xl font-bold mt-2">{stats?.totalUsers || 0}</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-600">Total de Pedidos</h3>
          <p className="text-3xl font-bold mt-2">{stats?.totalOrders || 0}</p>
        </div>

        {/* <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-600">Receita Total</h3>
          <p className="text-3xl font-bold mt-2">
            R$ {(stats?.totalRevenue || 0).toFixed(2)}
          </p>
        </div> */}

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-600">Perfis Ativos</h3>
          <p className="text-3xl font-bold mt-2">{stats?.totalProfiles || 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Ações Rápidas</h2>
          <div className="space-y-4">
            <button
              onClick={() => router.push('/admin/products/manage')}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              Gerenciar Perfis
            </button>
            <button
              onClick={() => router.push('/admin/users')}
              className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
            >
              Gerenciar Usuários
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Informações do Sistema</h2>
          <div className="space-y-2">
            <p><strong>Admin:</strong> {session?.user?.email}</p>
            <p><strong>Status:</strong> <span className="text-green-600">Online</span></p>
            <p><strong>Última atualização:</strong> {new Date().toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  )
} 