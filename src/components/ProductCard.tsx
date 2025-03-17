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

  const handleAction = async () => {
    if (!session) {
      window.location.href = '/login'
      return
    }

    // Remova esta condição para tratar proxies como perfis
    // if (product.type === 'PROXY') {
    //   // Redirecionar para WhatsApp
    //   const message = `Olá, gostaria de informações sobre o proxy: ${product.name}`
    //   window.open(`https://wa.me/5511999999999?text=${encodeURIComponent(message)}`, '_blank')
    //   return
    // }

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
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="relative h-48 w-full">
        <Image
          src={`/imagens/${product.imageUrl}`}
          alt={product.name}
          fill
          sizes="(max-width: 400px) 50vw"
          className="object-cover"
        />
      </div>
     
      <div className="p-4">
        <h3 className="text-lg font-semibold">{product.name}</h3>
        <p className="text-gray-600 mt-1">{product.description}</p>
        <p className="text-xl font-bold mt-2">R$ {Number(product.price).toFixed(2)}</p>
       
        <button
          onClick={handleAction}
          disabled={isAdding}
          className={`w-full mt-4 py-2 rounded transition-colors ${
            isAdding
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
        >
          {isAdding
            ? 'Adicionando...'
            : 'Adicionar ao Carrinho'
            // Remova esta condição para mostrar o mesmo texto para todos os produtos
            // : product.type === 'PROXY'
            //   ? 'Solicitar Informações'
            //   : 'Adicionar ao Carrinho'
          }
        </button>
      </div>
    </div>
  )
}
