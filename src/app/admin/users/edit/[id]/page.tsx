'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: number
  name: string
  email: string
  balance: number
  isAdmin: boolean
}

export default function EditUserPage({ params }: { params: { id: string } }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch(`/api/admin/users/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao atualizar usuário')
      }

      setSuccess('Usuário atualizado com sucesso!')
     
      // Redirecionar após um breve delay e forçar recarregamento
      setTimeout(() => {
        router.push('/admin/users')
        router.refresh() // Isso força o Next.js a revalidar os dados
      }, 1500)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao atualizar usuário')
    } finally {
      setSaving(false)
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
      <h1 className="text-2xl font-bold mb-6">Editar Usuário</h1>

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

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Nome
          </label>
          <input
            type="text"
            id="name"
            value={user.name}
            onChange={(e) => setUser({ ...user, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={user.email}
            onChange={(e) => setUser({ ...user, email: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>

        <div className="mb-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={user.isAdmin}
              onChange={(e) => setUser({ ...user, isAdmin: e.target.checked })}
              className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Administrador</span>
          </label>
        </div>

        <div className="flex justify-between">
          <button
            type="button"
            onClick={() => router.push('/admin/users')}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className={`px-4 py-2 rounded text-white ${
              saving ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </form>
    </div>
  )
}
