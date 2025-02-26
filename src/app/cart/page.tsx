'use client'

import { useCart } from '@/contexts/CartContext'
import Link from 'next/link'

export default function Cart() {
  const { items, removeItem, calculateTotal } = useCart()

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold mb-4">Seu carrinho está vazio</h2>
        <Link href="/" className="text-blue-600 hover:underline">
          Voltar às compras
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Carrinho</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between py-4 border-b">
            <div>
              <h3 className="font-semibold">{item.name}</h3>
              <p className="text-gray-600">Quantidade: {item.quantity}</p>
            </div>
            <div className="flex items-center gap-4">
              <p className="font-bold">
                R$ {Number(item.price).toFixed(2)}
              </p>
              <button
                onClick={() => removeItem(item.id)}
                className="text-red-600 hover:text-red-800"
              >
                Remover
              </button>
            </div>
          </div>
        ))}
        
        <div className="mt-6 pt-6 border-t">
          <div className="flex justify-between items-center mb-6">
            <span className="text-lg font-semibold">Total:</span>
            <span className="text-2xl font-bold">R$ {calculateTotal().toFixed(2)}</span>
          </div>
          
          <Link
            href="/checkout"
            className="w-full block text-center bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700"
          >
            Finalizar Compra
          </Link>
        </div>
      </div>
    </div>
  )
} 