'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

interface User {
  id: number
  name: string
  email: string
  balance: number
  isAdmin: boolean
  createdAt: string
  updatedAt: string
}

export default function UserDetails({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { data: session } = useSession()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [amount, setAmount] = useState('')
  const [operation, setOperation] = useState<'add' | 'subtract'>('add')

  useEffect(() => {
    if (!session?.user?.isAdmin) {
      router.push('/')
      return
    }

    loadUser()
  }, [session, router, params.id])

  const loadUser = async () => {
    try {
      const response = await fetch(`/api/admin/users/${params.id}`)
      if (!response.ok) {
        throw new Error('Erro ao carregar usuário')
      }
      const data = await response.json()
      setUser(data)
    } catch (error) {
      setError('Erro ao carregar dados do usuário')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateBalance = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError('Por favor, insira um valor válido')
      return
    }

    setError('')
    setSuccess('')
    
    try {
      const response = await fetch(`/api/admin/users/${params.id}/balance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: Number(amount),
          operation
        })
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao atualizar saldo')
      }

      setSuccess(data.message)
      setUser(data.user)
      setAmount('')
    } catch (error: any) {
      setError(error.message || 'Erro ao atualizar saldo')
    }
  }

  if (loading) {
    return <div className="p-6">Carregando...</div>
  }

  if (!user) {
    return <div className="p-6">Usuário não encontrado</div>
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Detalhes do Usuário</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600">Nome:</p>
            <p className="font-semibold">{user.name}</p>
          </div>
          <div>
            <p className="text-gray-600">Email:</p>
            <p className="font-semibold">{user.email}</p>
          </div>
          <div>
            <p className="text-gray-600">Saldo:</p>
            <p className="font-semibold text-xl">R$ {Number(user.balance).toFixed(2)}</p>
          </div>
          <div>
            <p className="text-gray-600">Tipo de Conta:</p>
            <p className="font-semibold">{user.isAdmin ? 'Administrador' : 'Cliente'}</p>
          </div>
          <div>
            <p className="text-gray-600">Criado em:</p>
            <p className="font-semibold">{new Date(user.createdAt).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-gray-600">Atualizado em:</p>
            <p className="font-semibold">{new Date(user.updatedAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Gerenciar Saldo</h2>
        
        <form onSubmit={handleUpdateBalance} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2">Operação:</label>
            <div className="flex space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio"
                  name="operation"
                  value="add"
                  checked={operation === 'add'}
                  onChange={() => setOperation('add')}
                />
                <span className="ml-2">Adicionar</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio"
                  name="operation"
                  value="subtract"
                  checked={operation === 'subtract'}
                  onChange={() => setOperation('subtract')}
                />
                <span className="ml-2">Subtrair</span>
              </label>
            </div>
          </div>
          
          <div>
            <label htmlFor="amount" className="block text-gray-700 mb-2">
              Valor (R$):
            </label>
            <input
              id="amount"
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="0.00"
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            {operation === 'add' ? 'Adicionar Saldo' : 'Subtrair Saldo'}
          </button>
        </form>
      </div>
      
      <div className="mt-6">
        <button
          onClick={() => router.push('/admin/users')}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Voltar para Lista de Usuários
        </button>
      </div>
    </div>
  )
}
