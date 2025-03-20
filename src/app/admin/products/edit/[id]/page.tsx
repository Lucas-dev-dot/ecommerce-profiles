'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function EditProduct({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadProduct()
  }, [])

  const loadProduct = async () => {
    try {
      const response = await fetch(`/api/admin/products/${params.id}`)
      if (!response.ok) throw new Error('Produto não encontrado')
      const data = await response.json()
      setProduct(data)
    } catch (error) {
      console.error('Erro:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch(`/api/admin/products/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(product)
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error)
      }

      router.push('/admin/products/manage')
    } catch (error) {
      setError('Erro ao atualizar produto')
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-b from-[#0e0122] to-[#11052c] flex items-center justify-center">
      <div className="text-white text-xl">Carregando...</div>
    </div>
  )
  
  if (!product) return (
    <div className="min-h-screen bg-gradient-to-b from-[#0e0122] to-[#11052c] flex items-center justify-center">
      <div className="text-white text-xl">Produto não encontrado</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0e0122] to-[#11052c] py-8">
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-2 text-white">
          Editar {product.type === 'PROFILE' ? 'Perfil' : 'Proxy'}
        </h1>
        <div className="w-32 h-1 bg-[#2c2979] mb-8"></div>
        
        {error && (
          <div className="bg-red-900/20 border border-red-400/30 text-red-300 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="max-w-md bg-[#161243] p-6 rounded-lg shadow-lg border border-[#2c2979]/30">
          <div className="mb-4">
            <label className="block text-gray-300 mb-2">Nome</label>
            <input
              type="text"
              value={product.name}
              onChange={(e) => setProduct({ ...product, name: e.target.value })}
              className="w-full px-3 py-2 bg-[#11052c] border border-[#2c2979]/30 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#2c2979]"
              required
              aria-label="Nome do produto"
              placeholder={`Digite o nome do ${product.type === 'PROFILE' ? 'perfil' : 'proxy'}`}
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-300 mb-2">Descrição</label>
            <textarea
              value={product.description}
              onChange={(e) => setProduct({ ...product, description: e.target.value })}
              className="w-full px-3 py-2 bg-[#11052c] border border-[#2c2979]/30 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#2c2979]"
              rows={4}
              required
              aria-label="Descrição do produto"
              placeholder={`Digite a descrição do ${product.type === 'PROFILE' ? 'perfil' : 'proxy'}`}
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-300 mb-2">Preço</label>
            <input
              type="number"
              value={product.price}
              onChange={(e) => setProduct({ ...product, price: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-[#11052c] border border-[#2c2979]/30 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#2c2979]"
              min="0"
              step="0.01"
              required
            aria-label="Preço do produto"
            placeholder={`Digite o preço do ${product.type === 'PROFILE' ? 'perfil' : 'proxy'}`}
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-300 mb-2">Tipo</label>
          <select
            value={product.type}
            onChange={(e) => setProduct({ ...product, type: e.target.value })}
            className="w-full px-3 py-2 bg-[#11052c] border border-[#2c2979]/30 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#2c2979]"
            required
            aria-label="Tipo do produto"
            title="Selecione o tipo do produto"
          >
            <option value="PROFILE">Perfil</option>
            <option value="PROXY">Proxy</option>
          </select>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 bg-[#2c2979] text-white px-4 py-2 rounded hover:bg-[#2c2979]/80 transition-colors"
          >
            Salvar
          </button>
          <button
            type="button"
            onClick={() => router.push('/admin/products/manage')}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  </div>
)
}