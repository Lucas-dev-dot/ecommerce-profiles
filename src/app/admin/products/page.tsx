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

  if (loading) return <div>Carregando...</div>

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Gerenciar Produtos</h1>

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lista de Produtos */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Produtos</h2>
          <div className="space-y-4">
            {products.map((product) => (
              <div 
                key={product.id}
                className="border p-4 rounded hover:bg-gray-50 cursor-pointer"
                onClick={() => {
                  setSelectedProduct(product)
                  setFileContent(product.profileFile || '')
                }}
              >
                <p><strong>Nome:</strong> {product.name}</p>
                <p><strong>Tipo:</strong> {product.type}</p>
                <p><strong>Arquivo:</strong> {product.profileFile ? 'Disponível' : 'Não configurado'}</p>
                
                {/* Adicione os links diretamente em cada item da lista */}
                <div className="mt-2 flex space-x-2">
                  <Link 
                    href={`/admin/products/edit/${product.id}`}
                    className="px-3 py-1 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600"
                    onClick={(e) => e.stopPropagation()} // Evita que o clique no link selecione o produto
                  >
                    Editar
                  </Link>
                  <Link 
                    href={`/admin/products/stock/${product.id}`}
                    className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
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
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">
              Editar {selectedProduct.type === 'PROFILE' ? 'Perfil' : 'Proxy'}: {selectedProduct.name}
            </h2>
            <div className="space-y-4">
              <textarea
                value={fileContent}
                onChange={(e) => setFileContent(e.target.value)}
                className="w-full h-64 border rounded p-2 font-mono"
                placeholder={`Cole aqui o conteúdo do ${selectedProduct.type === 'PROFILE' ? 'perfil' : 'proxy'}...`}
              />
              <button
                onClick={handleUpdateProfile}
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              >
                Salvar {selectedProduct.type === 'PROFILE' ? 'Perfil' : 'Proxy'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Remova esta seção, pois agora os links estão em cada item da lista */}
      {/* <div className="mt-6">
        <Link href={`/admin/products/edit/${selectedProduct?.id}`}>Editar</Link>
        <Link href={`/admin/products/stock/${selectedProduct?.id}`}>Gerenciar Estoque</Link>
      </div> */}
    </div>
  )
}
