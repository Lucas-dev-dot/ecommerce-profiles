'use client'
import { useState, useEffect, ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'

export default function ManageStock({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [product, setProduct] = useState<any>(null)
  const [stockCount, setStockCount] = useState<number>(0)
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

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    try {
      const files = event.target.files;
      if (!files) return;
  
      let totalProfiles = 0;
      
      // Process each file
      for (const file of Array.from(files)) {
        const content = await file.text();
        console.log(`Processing file: ${file.name}`);
  
        const response = await fetch(`/api/admin/products/${params.id}/stock`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ content }),
        });
  
        const data = await response.json();
        
        if (response.ok) {
          totalProfiles += data.items.length;
        }
      }
  
      alert(`${totalProfiles} perfis adicionados com sucesso!`);
      router.refresh();
  
    } catch (error) {
      console.error('Upload error:', error);
      alert('Erro ao adicionar perfis. Verifique o console para mais detalhes.');
    }
  };

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

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <label htmlFor="fileUpload" className="sr-only">Carregar arquivo</label>
            <input
              id="fileUpload"
              type="file"
              accept=".txt"
              multiple
              onChange={handleFileUpload}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-violet-50 file:text-violet-700
                hover:file:bg-violet-100"
              aria-label="Selecione um arquivo para upload"
            />
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => router.push('/admin/products/manage')}
              className="px-4 py-2 rounded bg-gray-500 hover:bg-gray-600 text-white"
            >
              Voltar
            </button>
          </div>
        </div>
      </div>
    </div>
  )

}