'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

export default function AddBalance() {
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { data: session } = useSession()

  if (!session) {
    router.push('/login')
    return null
  }

  const handleAddBalance = async () => {
    if (loading || !amount || Number(amount) <= 0) return
    
    setLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/balance/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: Number(amount) }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao adicionar saldo')
      }

      // Redirecionar para a página de produtos após adicionar saldo
      router.push('/products')
      // Forçar atualização da página para mostrar novo saldo
      router.refresh()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao adicionar saldo')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md mt-8">
      <h1 className="text-2xl font-bold mb-6">Adicionar Saldo</h1>
      
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <div className="space-y-4">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
            Valor (R$)
          </label>
          <input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Digite o valor a adicionar"
            aria-label="Valor em reais"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            min="0"
            step="0.01"
          />
        </div>

        <button
          onClick={handleAddBalance}
          disabled={loading || !amount || Number(amount) <= 0}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Processando...' : 'Adicionar Saldo'}
        </button>
      </div>
    </div>
  )
} 