'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ResetPassword({ params }: { params: { token: string } }) {
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/reset-password/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: params.token,
          newPassword
        })
      })
    
      if (response.ok) {
        router.push('/login?reset=success')
      } else {
        const data = await response.json()
        throw new Error(data.error || 'Falha ao redefinir senha')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao redefinir senha')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0e0122] to-[#11052c] flex items-center justify-center px-4">
      <div className="max-w-md w-full p-8 bg-[#161243] rounded-lg shadow-lg border border-[#2c2979]/30">
        <h2 className="text-2xl font-bold text-center text-white mb-2">Nova Senha</h2>
        <div className="w-16 h-1 bg-[#2c2979] mx-auto mb-6"></div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-900/20 text-red-300 rounded border border-red-400/30">
            {error}
          </div>
        )}
        
        <form onSubmit={handleReset} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
              Nova Senha
            </label>
            <input
              id="password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 bg-[#11052c] border border-[#2c2979]/30 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#2c2979]"
              placeholder="Digite sua nova senha"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 bg-[#2c2979] text-white rounded hover:bg-[#2c2979]/80 transition-colors ${
              loading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Processando...' : 'Confirmar Nova Senha'}
          </button>
        </form>
      </div>
    </div>
  )
}
