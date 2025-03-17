'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: number
  name: string
  email: string
  balance: number
}

export default function AdjustBalancePage({ params }: { params: { id: string } }) {
  const [user, setUser] = useState<User | null>(null)
  const [amount, setAmount] = useState<number>(0)
  const [operation, setOperation] = useState<'add' | 'subtract'>('add')
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  useEffect(() => {
    async function loadUser() {
      try {
        const response = await fetch(`/api/admin/users/${params.id}`)
        if (!response.ok) throw new Error('Erro ao carregar usuário')
        const data = await response.json()
        setUser(data)
      } catch (error) {
        setError('Erro ao carregar dados do usuário')
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [params.id])

  async function handleAdjustBalance(e: React.FormEvent) {
    e.preventDefault()
    
    // Validação do valor
    if (!user || amount <= 0) {
      setError('Por favor, insira um valor positivo maior que zero')
      return
    }

    setProcessing(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch(`/api/admin/users/${params.id}/balance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          amount: amount,
          operation: operation 
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao ajustar saldo')
      }

      setUser(data.user)
      setAmount(0)
      setSuccess(`Saldo ${operation === 'add' ? 'adicionado' : 'subtraído'} com sucesso! Novo saldo: R$ ${Number(data.user.balance).toFixed(2)}`)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao ajustar saldo')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return <div className="p-4 text-center">Carregando dados do usuário...</div>
  }

  if (!user) {
    return (
      <div className="p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Usuário não encontrado
        </div>
        <button
          onClick={() => router.push('/admin/users')}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Voltar
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Ajustar Saldo</h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-2">{user.name}</h2>
        <p className="text-gray-600 mb-1">{user.email}</p>
        <p className="text-lg font-bold">
          Saldo Atual: R$ {Number(user.balance).toFixed(2)}
        </p>
      </div>

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

      <form onSubmit={handleAdjustBalance} className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Operação:
          </label>
          <div className="flex space-x-4 mb-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio h-4 w-4 text-blue-600"
                name="operation"
                checked={operation === 'add'}
                onChange={() => setOperation('add')}
              />
              <span className="ml-2 text-gray-700">Adicionar Saldo</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio h-4 w-4 text-red-600"
                name="operation"
                checked={operation === 'subtract'}
                onChange={() => setOperation('subtract')}
              />
              <span className="ml-2 text-gray-700">Subtrair Saldo</span>
            </label>
          </div>

          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
            Valor (R$)
          </label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => {
              const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
              setAmount(value >= 0 ? value : 0);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            min="0.01"
            step="0.01"
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            Insira um valor positivo para {operation === 'add' ? 'adicionar ao' : 'subtrair do'} saldo.
          </p>
        </div>

        <div className="flex justify-between">
          <button
            type="button"
            onClick={() => router.push('/admin/users')}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Voltar
          </button>
          
          <button
            type="submit"
            disabled={processing || amount <= 0}
            className={`px-4 py-2 rounded text-white ${
              processing || amount <= 0 
                ? 'bg-indigo-400 cursor-not-allowed' 
                : operation === 'add'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {processing 
              ? 'Processando...' 
              : operation === 'add'
                ? 'Adicionar Saldo'
                : 'Subtrair Saldo'
            }
          </button>
        </div>
      </form>
    </div>
  )
}
