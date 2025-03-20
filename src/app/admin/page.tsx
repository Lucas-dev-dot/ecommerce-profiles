'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

interface DashboardStats {
  totalUsers: number
  totalOrders: number
  totalRevenue: any
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
      <div className="min-h-screen bg-gradient-to-b from-[#0e0122] to-[#11052c] flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-semibold mb-2 text-white">Carregando...</div>
          <div className="text-gray-300">Aguarde enquanto carregamos os dados</div>
        </div>
      </div>
    )
  }

  // Função para formatar o valor da receita total
  const formatRevenue = () => {
    if (!stats) return "R$ 0.00";
    
    if (typeof stats.totalRevenue === 'object' && stats.totalRevenue !== null) {
      return `R$ ${stats.totalRevenue.toString()}`;
    }
    
    if (typeof stats.totalRevenue === 'string') {
      return `R$ ${parseFloat(stats.totalRevenue).toFixed(2)}`;
    }
    
    if (typeof stats.totalRevenue === 'number') {
      return `R$ ${stats.totalRevenue.toFixed(2)}`;
    }
    
    return "R$ 0.00";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0e0122] to-[#11052c] py-8">
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-2 text-white">Painel Administrativo</h1>
        <div className="w-32 h-1 bg-[#2c2979] mb-8"></div>

        {error && (
          <div className="bg-red-900/20 border border-red-400/30 text-red-300 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-[#161243] rounded-lg shadow-lg p-6 border border-[#2c2979]/30">
            <h3 className="text-lg font-semibold text-gray-300">Total de Usuários</h3>
            <p className="text-3xl font-bold mt-2 text-white">{stats?.totalUsers || 0}</p>
          </div>

          <div className="bg-[#161243] rounded-lg shadow-lg p-6 border border-[#2c2979]/30">
            <h3 className="text-lg font-semibold text-gray-300">Total de Pedidos</h3>
            <p className="text-3xl font-bold mt-2 text-white">{stats?.totalOrders || 0}</p>
          </div>

          <div className="bg-[#161243] rounded-lg shadow-lg p-6 border border-[#2c2979]/30">
            <h3 className="text-lg font-semibold text-gray-300">Receita Total</h3>
            <p className="text-3xl font-bold mt-2 text-white">
              {formatRevenue()}
            </p>
          </div>

          <div className="bg-[#161243] rounded-lg shadow-lg p-6 border border-[#2c2979]/30">
            <h3 className="text-lg font-semibold text-gray-300">Perfis Ativos</h3>
            <p className="text-3xl font-bold mt-2 text-white">{stats?.totalProfiles || 0}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <div className="bg-[#161243] rounded-lg shadow-lg p-6 border border-[#2c2979]/30">
            <h2 className="text-xl font-semibold mb-4 text-white">Ações Rápidas</h2>
            <div className="space-y-4">
              <button
                onClick={() => router.push('/admin/products/manage')}
                className="w-full bg-[#2c2979] text-white py-2 px-4 rounded hover:bg-[#2c2979]/80 transition-colors"
              >
                Gerenciar Produtos
              </button>
              <button
                onClick={() => router.push('/admin/users')}
                className="w-full bg-[#2c2979] text-white py-2 px-4 rounded hover:bg-[#2c2979]/80 transition-colors"
              >
                Gerenciar Usuários
              </button>
              <button
                onClick={() => router.push('/admin/coupons')}
                className="w-full bg-[#2c2979] text-white py-2 px-4 rounded hover:bg-[#2c2979]/80 transition-colors"
              >
                Gerenciar Cupons
              </button>
            </div>
          </div>

          <div className="bg-[#161243] rounded-lg shadow-lg p-6 border border-[#2c2979]/30">
            <h2 className="text-xl font-semibold mb-4 text-white">Informações do Sistema</h2>
            <div className="space-y-2 text-gray-300">
              <p><strong className="text-white">Admin:</strong> {session?.user?.email}</p>
              <p><strong className="text-white">Status:</strong> <span className="text-green-400">Online</span></p>
              <p><strong className="text-white">Última atualização:</strong> {new Date().toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
