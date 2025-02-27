'use client'
import type { Product as PrismaProduct, product_type } from '@prisma/client/edge'
import { useCart } from '@/contexts/CartContext'
import Image from 'next/image'
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { PrismaClient } from '@prisma/client/edge'

interface Product {
  id: number
  name: string
  description: string
  price: any
  type: product_type
  imageUrl?: string
  profileFile?: string | null
  stock?: number
  createdAt?: Date
  _count?: {
    stock: number
  }
}

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart()
  const { data: session } = useSession()
  const router = useRouter()
  const [isAdding, setIsAdding] = useState(false)
  
  // Verificar se o produto tem estoque disponível (apenas para PROFILE)
  const hasStock = product.type === 'PROFILE' ? (product._count?.stock || 0) > 0 : true
  
  // Debug para verificar os dados do produto
  console.log(`Renderizando produto: ${product.id} - ${product.name} - Tipo: ${product.type}`)
  
  const handleAction = async () => {
    if (!session) {
      router.push('/login')
      return
    }

    if (product.type === 'PROXY') {
      // Redirecionar para WhatsApp
      const message = `Olá, gostaria de informações sobre o proxy: ${product.name}`
      window.open(`https://wa.me/5511999999999?text=${encodeURIComponent(message)}`, '_blank')
    } else {
      // Verificar estoque antes de adicionar ao carrinho (apenas para PROFILE)
      if (!hasStock) {
        alert('Este produto está fora de estoque no momento.')
        return
      }
      
      // Adicionar ao carrinho
      setIsAdding(true)
      try {
        // Garantir que todas as propriedades necessárias estejam presentes
        const productToAdd = {
          ...product,
          stock: product.stock || 0,
          imageUrl: product.imageUrl || '/placeholder.jpg',
          profileFile: product.profileFile || null,
          createdAt: product.createdAt || new Date(),
          updatedAt: new Date(),
          isUsed: false,
          userId: null
        }
        addItem(productToAdd)
        // Feedback visual opcional
        alert('Produto adicionado ao carrinho!')
      } catch (error) {
        console.error('Erro ao adicionar ao carrinho:', error)
        alert('Erro ao adicionar ao carrinho')
      } finally {
        setIsAdding(false)
      }
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="relative h-48 w-full">
        <Image
          src={product.imageUrl || '/placeholder.jpg'} 
          alt={product.name}
          fill
          className="object-cover"
        />
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold">{product.name}</h3>
        <p className="text-gray-600 mt-1">{product.description}</p>
        <p className="text-xl font-bold mt-2">R$ {Number(product.price).toFixed(2)}</p>
        
        {/* Indicador de estoque (apenas para PROFILE) */}
        {product.type === 'PROFILE' && (
          <div className={`mt-2 ${hasStock ? 'text-green-600' : 'text-red-600'}`}>
            {hasStock ? 'Em estoque' : 'Fora de estoque'}
          </div>
        )}
        
        <button 
          onClick={handleAction}
          disabled={isAdding}
          className={`w-full mt-4 py-2 rounded transition-colors ${
            isAdding 
              ? 'bg-gray-400 cursor-not-allowed' 
              : product.type === 'PROXY'
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : hasStock
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-300 text-gray-700'
          }`}
        >
          {isAdding 
            ? 'Adicionando...' 
            : product.type === 'PROXY' 
              ? 'Solicitar Informações' 
              : hasStock
                ? 'Adicionar ao Carrinho'
                : 'Fora de Estoque'
          }
        </button>
      </div>
    </div>
  )
} 