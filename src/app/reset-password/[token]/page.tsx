'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ResetPassword({ params }: { params: { token: string } }) {
  const [newPassword, setNewPassword] = useState('')
  const router = useRouter()

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    
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
      console.error('Reset failed:', await response.json())
    }
  }
  

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleReset} className="space-y-4 w-full max-w-md p-8 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold text-center">Nova Senha</h2>
        <div>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            placeholder="Digite sua nova senha"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Confirmar Nova Senha
        </button>
      </form>
    </div>
  )
}
