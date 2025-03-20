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

      let totalItems = 0;
      
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
          totalItems += data.items.length;
        }
      }

      const itemType = product.type === 'PROFILE' ? 'perfis' : 'proxies';
      alert(`${totalItems} ${itemType} adicionados com sucesso!`);
      
      loadProduct();
    } catch (error) {
      console.error('Upload error:', error);
      alert('Erro ao adicionar itens. Verifique o console para mais detalhes.');
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-b from-[#0e0122] to-[#11052c] flex items-center justify-center">
      <div className="text-white text-xl">Carregando...</div>
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-gradient-to-b from-[#0e0122] to-[#11052c] flex items-center justify-center">
      <div className="bg-red-900/20 border border-red-400/30 text-red-300 px-4 py-3 rounded">
        {error}
      </div>
    </div>
  )

  if (!product) return (
    <div className="min-h-screen bg-gradient-to-b from-[#0e0122] to-[#11052c] flex items-center justify-center">
      <div className="text-white text-xl">Produto não encontrado</div>
    </div>
  )

  const itemType = product.type === 'PROFILE' ? 'perfil' : 'proxy';
  const itemTypePlural = product.type === 'PROFILE' ? 'perfis' : 'proxies';

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0e0122] to-[#11052c] py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-2 text-white">
          Gerenciar Estoque de {itemTypePlural}
        </h1>
        <div className="w-32 h-1 bg-[#2c2979] mb-8"></div>
      
        <div className="bg-[#161243] rounded-lg shadow-lg p-6 border border-[#2c2979]/30">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-white">{product.name}</h2>
            <p className="text-gray-300">{product.description}</p>
            <p className="text-sm text-gray-400">Tipo: {product.type}</p>
          </div>

          <div className="mb-6">
            <p className="text-lg text-gray-300">
              Quantidade em estoque: <span className="font-bold text-white">{stockCount}</span>
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
                className="block w-full text-sm text-gray-300
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border file:border-[#2c2979]/30
                  file:text-sm file:font-semibold
                  file:bg-[#2c2979] file:text-white
                  hover:file:bg-[#2c2979]/80 file:transition-colors"
                aria-label={`Selecione um arquivo de ${itemType} para upload`}
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => router.push('/admin/products/manage')}
                className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-700 text-white transition-colors"
              >
                Voltar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
