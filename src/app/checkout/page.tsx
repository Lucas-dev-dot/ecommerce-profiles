'use client'

import { useCart } from '@/contexts/CartContext'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { DownloadProfiles } from '@/components/DownloadProfiles'

export default function Checkout() {
  const { items, clearCart, calculateTotal } = useCart()
  const router = useRouter()
  const { data: session } = useSession()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showDownloads, setShowDownloads] = useState(false)

  const handleCheckout = async () => {
    try {
      setLoading(true)
      setError('')
  
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: items.map(item => ({
            productId: item.id,
            quantity: 1,
            price: Number(item.price),
            type: item.type // Add the type property here
          })),
          totalAmount: calculateTotal()
        })
      })
  
      if (!response.ok) {
        if (response.status === 405) {
          throw new Error('Método não permitido')
        }
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao processar pedido')
      }
  
      const data = await response.json()
      clearCart()
      router.push(`/dashboard/downloads?order=${data.id}`)
    } catch (error: any) {
      console.error('Erro no checkout:', error)
      setError(error.message || 'Erro ao processar pedido')
    } finally {
      setLoading(false)
    }
  }
  
  
  if (!session) {
    router.push('/login')
    return null
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {!showDownloads ? (
        <>
          <h1 className="text-2xl font-bold mb-6">Checkout</h1>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Resumo do Pedido</h2>
            
            {items.map((item) => (
              <div key={item.id} className="flex justify-between py-2 border-b">
                <span>{item.name}</span>
                <span>R$ {Number(item.price).toFixed(2)}</span>
              </div>
            ))}

            <div className="flex justify-between mt-4 font-bold">
              <span>Total</span>
              <span>R$ {calculateTotal().toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={loading || items.length === 0}
            className={`w-full bg-red-700 text-white py-3 rounded-lg font-semibold
              ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-800'}
            `}
          >
            {loading ? 'Processando...' : 'Finalizar Compra'}
          </button>

          <p className="text-sm text-gray-600 mt-4 text-center">
            Ao finalizar a compra, você concorda com nossos termos de serviço.
          </p>
        </>
      ) : (
        <div>
          <h1 className="text-2xl font-bold mb-6 text-center">Compra Realizada com Sucesso!</h1>
          <p className="text-center mb-8">Seus perfis estão disponíveis para download abaixo:</p>
          <DownloadProfiles />
        </div>
      )}
    </div>
  )
}