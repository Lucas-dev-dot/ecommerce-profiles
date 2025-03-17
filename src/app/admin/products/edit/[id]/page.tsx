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

  if (loading) return <div>Carregando...</div>
  if (!product) return <div>Produto não encontrado</div>

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">
        Editar {product.type === 'PROFILE' ? 'Perfil' : 'Proxy'}
      </h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-md">
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Nome</label>
          <input
            type="text"
            value={product.name}
            onChange={(e) => setProduct({ ...product, name: e.target.value })}
            className="w-full p-2 border rounded"
            required
            aria-label="Nome do produto"
            placeholder={`Digite o nome do ${product.type === 'PROFILE' ? 'perfil' : 'proxy'}`}
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Descrição</label>
          <textarea
            value={product.description}
            onChange={(e) => setProduct({ ...product, description: e.target.value })}
            className="w-full p-2 border rounded"
            rows={4}
            required
            aria-label="Descrição do produto"
            placeholder={`Digite a descrição do ${product.type === 'PROFILE' ? 'perfil' : 'proxy'}`}
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Preço</label>
          <input
            type="number"
            value={product.price}
            onChange={(e) => setProduct({ ...product, price: Number(e.target.value) })}
            className="w-full p-2 border rounded"
            min="0"
            step="0.01"
            required
            aria-label="Preço do produto"
            placeholder={`Digite o preço do ${product.type === 'PROFILE' ? 'perfil' : 'proxy'}`}
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Tipo</label>
          <select
            value={product.type}
            onChange={(e) => setProduct({ ...product, type: e.target.value })}
            className="w-full p-2 border rounded"
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
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Salvar
          </button>
          <button
            type="button"
            onClick={() => router.push('/admin/products/manage')}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )

}