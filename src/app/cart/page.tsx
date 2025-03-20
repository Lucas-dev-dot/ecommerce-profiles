'use client'

import { useCart } from '@/contexts/CartContext'
import Link from 'next/link'

export default function Cart() {
  const { items, removeItem, calculateTotal } = useCart()

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0e0122] to-[#11052c] flex items-center justify-center">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-4 text-white">Seu carrinho está vazio</h2>
          <Link href="/" className="text-[#2c2979] hover:text-[#2c2979]/80 transition-colors">
            Voltar às compras
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0e0122] to-[#11052c] py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 text-white">Carrinho</h1>
        
        <div className="bg-[#161243] rounded-lg shadow-lg p-6 border border-[#2c2979]/30">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between py-4 border-b border-[#2c2979]/20">
              <div>
                <h3 className="font-semibold text-white">{item.name}</h3>
                <p className="text-gray-300">Quantidade: {item.quantity}</p>
              </div>
              <div className="flex items-center gap-4">
                <p className="font-bold text-white">
                  R$ {Number(item.price).toFixed(2)}
                </p>
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-red-400 hover:text-red-300 transition-colors"
                >
                  Remover
                </button>
              </div>
            </div>
          ))}
          
          <div className="mt-6 pt-6 border-t border-[#2c2979]/20">
            <div className="flex justify-between items-center mb-6">
              <span className="text-lg font-semibold text-white">Total:</span>
              <span className="text-2xl font-bold text-white">R$ {calculateTotal().toFixed(2)}</span>
            </div>
            
            <Link
              href="/checkout"
              className="w-full block text-center bg-[#2c2979] text-white py-3 rounded-md hover:bg-[#2c2979]/80 transition-colors"
            >
              Finalizar Compra
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
