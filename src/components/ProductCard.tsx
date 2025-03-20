'use client'

import { useCart } from '../contexts/CartContext'
import { useSession } from 'next-auth/react'
import { useState } from 'react'
import Image from 'next/image'
import Decimal from 'decimal.js'
import { product_type } from '@prisma/client'

interface ProductCardProps {
  product: {
    id: string
    name: string
    description: string
    price: number
    imageUrl?: string
    type: string
    profileFile?: string | null
    createdAt?: Date
  }
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart()
  const { data: session } = useSession()
  const [isAdding, setIsAdding] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const handleAction = async () => {
    if (!session) {
      window.location.href = '/login'
      return
    }

    setIsAdding(true)
    try {
      const productToAdd = {
        ...product,
        id: parseInt(product.id),
        imageUrl: product.imageUrl || '/placeholder.jpg',
        profileFile: product.profileFile || null,
        createdAt: product.createdAt || new Date(),
        updatedAt: new Date(),
        isUsed: false,
        userId: null,
        price: new Decimal(product.price),
        type: product.type as product_type,
        description: product.description || null
      }
     
      addItem(productToAdd)
      alert('Produto adicionado ao carrinho!')
    } catch (error) {
      console.error('Erro ao adicionar ao carrinho:', error)
      alert('Erro ao adicionar ao carrinho')
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <div
      className="bg-[#161243] rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-[0_0_15px_rgba(44,41,121,0.5)] border border-[#2c2979]/30 hover:-translate-y-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative">
        {/* Badge para mostrar o tipo de produto */}
        <div className={`absolute top-2 right-2 z-10 px-3 py-1 text-xs font-semibold rounded-full ${
          product.type === 'PROFILE' ? 'bg-[#2c2979] text-white' : 'bg-[#0e0122] text-white border border-[#2c2979]'
        }`}>
          {product.type === 'PROFILE' ? 'Perfil' : 'Proxy'}
        </div>
       
        {/* Imagem com efeito de zoom suave ao passar o mouse */}
        <div className="relative h-48 w-full overflow-hidden bg-[#11052c]">
          <Image
            src={`/imagens/${product.imageUrl}`}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className={`object-cover transition-transform duration-500 ${isHovered ? 'scale-110' : 'scale-100'}`}
          />
        </div>
      </div>
     
      <div className="p-5">
        <h3 className="text-lg font-semibold text-white mb-2">{product.name}</h3>
        <p className="text-gray-300 text-sm h-12 overflow-hidden">{product.description}</p>
       
        <div className="mt-4">
          <p className="text-2xl font-bold text-white">
            R$ {Number(product.price).toFixed(2).replace('.', ',')}
          </p>
        </div>
       
        <button
          onClick={handleAction}
          disabled={isAdding}
          className={`w-full mt-4 py-2.5 rounded-md transition-colors ${
            isAdding
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-[#2c2979] hover:bg-[#2c2979]/80 text-white'
          }`}
        >
          {isAdding
            ? 'Adicionando...'
            : 'Adicionar ao Carrinho'
          }
        </button>
      </div>
    </div>
  )
}
