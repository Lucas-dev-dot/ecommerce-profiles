'use client'

import { useCart } from '@/contexts/CartContext'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { DownloadProfiles } from '@/components/DownloadProfiles'

export default function Checkout() {
  const { items, clearCart, calculateTotal } = useCart()
  const router = useRouter()
  const { data: session, status } = useSession()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showDownloads] = useState(false)

  // Novos estados para o cupom
  const [couponCode, setCouponCode] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponError, setCouponError] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount: number;
    type: 'PERCENTAGE' | 'FIXED';
  } | null>(null)

  // Use useEffect para redirecionar em vez de fazer isso diretamente no corpo do componente
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])
  
  // Se ainda estiver carregando ou não autenticado, mostre um estado de carregamento
  if (status === 'loading' || status === 'unauthenticated') {
    return <div className="min-h-screen bg-gradient-to-b from-[#0e0122] to-[#11052c] flex items-center justify-center">
      <div className="text-white">Carregando...</div>
    </div>
  }

  // Função para calcular o total com desconto
  const calculateDiscountedTotal = () => {
    const total = calculateTotal();
   
    if (!appliedCoupon) return total;
   
    if (appliedCoupon.type === 'PERCENTAGE') {
      const discount = total * (appliedCoupon.discount / 100);
      return total - discount;
    } else {
      return Math.max(0, total - appliedCoupon.discount);
    }
  };

  // Função para aplicar o cupom
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Digite um código de cupom');
      return;
    }
   
    setCouponLoading(true);
    setCouponError('');
   
    try {
      const response = await fetch(`/api/coupons/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: couponCode,
          items: items.map(item => ({
            productId: item.id,
            price: Number(item.price)
          }))
        }),
      });
     
      const data = await response.json();
     
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao validar cupom');
      }
     
      setAppliedCoupon(data.coupon);
      setCouponCode('');
    } catch (error) {
      setCouponError(error instanceof Error ? error.message : 'Cupom inválido');
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  // Função para remover o cupom aplicado
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError('');
  };

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
            type: item.type
          })),
          totalAmount: calculateDiscountedTotal(),
          couponCode: appliedCoupon?.code || null
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0e0122] to-[#11052c] py-12">
      <div className="max-w-4xl mx-auto px-4">
        {!showDownloads ? (
          <>
            <h1 className="text-3xl font-bold mb-6 text-white">Checkout</h1>
            <div className="w-24 h-1 bg-[#2c2979] mb-8"></div>

            {error && (
              <div className="bg-red-900/20 border border-red-400/30 text-red-300 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <div className="bg-[#161243] rounded-lg shadow-lg p-6 mb-6 border border-[#2c2979]/30">
              <h2 className="text-xl font-semibold mb-4 text-white">Resumo do Pedido</h2>
             
              {items.map((item) => (
                <div key={item.id} className="flex justify-between py-2 border-b border-[#2c2979]/20">
                  <span className="text-white">{item.name}</span>
                  <span className="text-white">R$ {Number(item.price).toFixed(2)}</span>
                </div>
              ))}

              <div className="flex justify-between mt-4 font-bold">
                <span className="text-white">Subtotal</span>
                <span className="text-white">R$ {calculateTotal().toFixed(2)}</span>
              </div>
             
              {/* Seção de cupom */}
              <div className="mt-6 pt-4 border-t border-[#2c2979]/20">
                <h3 className="text-lg font-medium text-white mb-2">Cupom de desconto</h3>
               
                {appliedCoupon ? (
                  <div className="bg-[#11052c] p-3 rounded-md border border-[#2c2979]/30 mb-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-white font-medium">{appliedCoupon.code}</p>
                        <p className="text-sm text-gray-300">
                          {appliedCoupon.type === 'PERCENTAGE'
                            ? `${appliedCoupon.discount}% de desconto`
                            : `R$ ${appliedCoupon.discount.toFixed(2)} de desconto`}
                        </p>
                      </div>
                      <button
                        onClick={handleRemoveCoupon}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        Remover
                      </button>
                    </div>
                   
                    <div className="mt-2 pt-2 border-t border-[#2c2979]/20 flex justify-between">
                      <span className="text-gray-300">Desconto:</span>
                      <span className="text-green-400">
                        - R$ {(calculateTotal() - calculateDiscountedTotal()).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Digite o código do cupom"
                      className="flex-1 px-3 py-2 bg-[#11052c] border border-[#2c2979]/30 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#2c2979]"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      disabled={couponLoading || !couponCode.trim()}
                      className={`px-4 py-2 rounded text-white ${
                        couponLoading || !couponCode.trim()
                          ? 'bg-gray-600 cursor-not-allowed'
                          : 'bg-[#2c2979] hover:bg-[#2c2979]/80'
                      } transition-colors`}
                    >
                      {couponLoading ? 'Aplicando...' : 'Aplicar'}
                    </button>
                  </div>
                )}
               
                {couponError && (
                  <p className="text-red-400 text-sm mb-3">{couponError}</p>
                )}
              </div>
             
              {/* Total com desconto */}
              <div className="flex justify-between mt-4 pt-4 border-t border-[#2c2979]/20 text-lg font-bold">
                <span className="text-white">Total</span>
                <span className="text-white">R$ {calculateDiscountedTotal().toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={loading || items.length === 0}
              className={`w-full bg-[#2c2979] text-white py-3 rounded-lg font-semibold
                ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#2c2979]/80 transition-colors'}
              `}
            >
              {loading ? 'Processando...' : 'Finalizar Compra'}
            </button>

            <p className="text-sm text-gray-300 mt-4 text-center">
              Ao finalizar a compra, você concorda com nossos termos de serviço.
            </p>
          </>
        ) : (
          <div>
            <h1 className="text-2xl font-bold mb-6 text-center text-white">Compra Realizada com Sucesso!</h1>
            <p className="text-center mb-8 text-gray-300">Seus perfis estão disponíveis para download abaixo:</p>
            <DownloadProfiles />
          </div>
        )}
      </div>
    </div>
  )
}
