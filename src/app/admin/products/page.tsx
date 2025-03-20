'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import type { Product as PrismaProduct } from '.prisma/client'
import Link from 'next/link'

interface Product extends PrismaProduct {
  profileFile: string | null;
  stock: {
    isUsed: boolean;
  }[];
}

export default function AdminProducts() {
  const { data: session } = useSession()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [fileContent, setFileContent] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (!session?.user?.isAdmin) {
      router.push('/')
      return
    }

    loadProducts()
  }, [session, router])

  async function loadProducts() {
    try {
      const response = await fetch('/api/admin/products');
      if (!response.ok) throw new Error('Erro ao carregar produtos');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      setError('Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateProfile() {
    if (!selectedProduct) return

    try {
      const response = await fetch(`/api/admin/products/${selectedProduct.id}/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ profileContent: fileContent }),
      })

      if (!response.ok) throw new Error('Erro ao atualizar perfil')

      setSuccess('Perfil atualizado com sucesso!')
      loadProducts()
      setFileContent('')
      setSelectedProduct(null)
    } catch (error) {
      setError('Erro ao atualizar perfil')
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-b from-[#0e0122] to-[#11052c] flex items-center justify-center">
      <div className="text-white text-xl">Carregando...</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0e0122] to-[#11052c] py-8">
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-2 text-white">Gerenciar Produtos</h1>
        <div className="w-32 h-1 bg-[#2c2979] mb-8"></div>

        {error && (
          <div className="bg-red-900/20 border border-red-400/30 text-red-300 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-900/20 border border-green-400/30 text-green-300 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Lista de Produtos */}
          <div className="bg-[#161243] rounded-lg shadow-lg p-6 border border-[#2c2979]/30">
            <h2 className="text-xl font-semibold mb-4 text-white">Produtos</h2>
            <div className="space-y-4">
              {products.map((product) => (
                <div 
                  key={product.id}
                  className="border border-[#2c2979]/30 p-4 rounded hover:bg-[#11052c] cursor-pointer transition-colors"
                  onClick={() => {
                    setSelectedProduct(product)
                    setFileContent(product.profileFile || '')
                  }}
                >
                  <p className="text-white"><strong>Nome:</strong> {product.name}</p>
                  <p className="text-gray-300"><strong className="text-white">Tipo:</strong> {product.type}</p>
                  <p className="text-gray-300">
                    <strong className="text-white">Arquivo:</strong> {product.profileFile ? 'Disponível' : 'Não configurado'}
                  </p>
                  
                  {/* Adicione os links diretamente em cada item da lista */}
                  <div className="mt-2 flex space-x-2">
                    <Link 
                      href={`/admin/products/edit/${product.id}`}
                      className="px-3 py-1 text-sm bg-[#2c2979] text-white rounded hover:bg-[#2c2979]/80 transition-colors"
                      onClick={(e) => e.stopPropagation()} // Evita que o clique no link selecione o produto
                    >
                      Editar
                    </Link>
                    <Link 
                      href={`/admin/products/stock/${product.id}`}
                      className="px-3 py-1 text-sm bg-[#2c2979] text-white rounded hover:bg-[#2c2979]/80 transition-colors"
                      onClick={(e) => e.stopPropagation()} // Evita que o clique no link selecione o produto
                    >
                      Gerenciar Estoque
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Editor de Perfil */}
          {selectedProduct && (selectedProduct.type === 'PROFILE' || selectedProduct.type === 'PROXY') && (
            <div className="bg-[#161243] rounded-lg shadow-lg p-6 border border-[#2c2979]/30">
              <h2 className="text-xl font-semibold mb-4 text-white">
                Editar {selectedProduct.type === 'PROFILE' ? 'Perfil' : 'Proxy'}: {selectedProduct.name}
              </h2>
              <div className="space-y-4">
                <textarea
                  value={fileContent}
                  onChange={(e) => setFileContent(e.target.value)}
                  className="w-full h-64 bg-[#11052c] border border-[#2c2979]/30 rounded p-2 font-mono text-white focus:outline-none focus:ring-2 focus:ring-[#2c2979]"
                  placeholder={`Cole aqui o conteúdo do ${selectedProduct.type === 'PROFILE' ? 'perfil' : 'proxy'}...`}
                />
                <button
                  onClick={handleUpdateProfile}
                  className="w-full bg-[#2c2979] text-white py-2 rounded hover:bg-[#2c2979]/80 transition-colors"
                >
                  Salvar {selectedProduct.type === 'PROFILE' ? 'Perfil' : 'Proxy'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
