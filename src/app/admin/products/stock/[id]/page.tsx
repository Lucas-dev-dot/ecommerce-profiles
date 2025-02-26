'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ManageStock({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [product, setProduct] = useState<any>(null)
  const [stockCount, setStockCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [addingStock, setAddingStock] = useState(false)

  useEffect(() => {
    loadProduct()
  }, [])

  const loadProduct = async () => {
    try {
      const response = await fetch(`/api/admin/products/${params.id}`)
      if (!response.ok) throw new Error('Produto não encontrado')
      const data = await response.json()
      setProduct(data)
      setStockCount(data._count?.stock || 0)
    } catch (error) {
      console.error('Erro:', error)
      setError(error instanceof Error ? error.message : 'Erro ao carregar produto')
    } finally {
      setLoading(false)
    }
  }

  const handleAddStock = async () => {
    try {
      setAddingStock(true)
      const response = await fetch(`/api/admin/products/${params.id}/stock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ quantity: 1 })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error)
      }

      await loadProduct() // Recarrega os dados do produto
      alert('Estoque adicionado com sucesso!')
    } catch (error) {
      console.error('Erro ao adicionar estoque:', error)
      setError('Erro ao adicionar estoque')
    } finally {
      setAddingStock(false)
    }
  }

  if (loading) return <div className="p-4">Carregando...</div>
  if (error) return <div className="p-4 text-red-600">{error}</div>
  if (!product) return <div className="p-4">Produto não encontrado</div>

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Gerenciar Estoque</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">{product.name}</h2>
          <p className="text-gray-600">{product.description}</p>
        </div>

        <div className="mb-6">
          <p className="text-lg">
            Quantidade em estoque: <span className="font-bold">{stockCount}</span>
          </p>
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleAddStock}
            disabled={addingStock}
            className={`px-4 py-2 rounded ${
              addingStock
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-500 hover:bg-green-600'
            } text-white`}
          >
            {addingStock ? 'Adicionando...' : 'Adicionar ao Estoque'}
          </button>

          <button
            onClick={() => router.push('/admin/products/manage')}
            className="px-4 py-2 rounded bg-gray-500 hover:bg-gray-600 text-white"
          >
            Voltar
          </button>
        </div>
      </div>
    </div>
  )
} 