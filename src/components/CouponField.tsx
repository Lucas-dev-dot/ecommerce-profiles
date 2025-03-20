'use client'

import { useState } from 'react'

interface CouponFieldProps {
  onApplyCoupon: (discount: number, type: string) => void
  onRemoveCoupon: () => void
}

export default function CouponField({ onApplyCoupon, onRemoveCoupon }: CouponFieldProps) {
  const [couponCode, setCouponCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string
    discount: number
    type: string
  } | null>(null)

  async function handleApplyCoupon() {
    if (!couponCode.trim()) {
      setError('Digite um código de cupom')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code: couponCode })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Cupom inválido')
      }

      setAppliedCoupon({
        code: couponCode,
        discount: data.discount,
        type: data.type
      })

      onApplyCoupon(data.discount, data.type)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao aplicar cupom')
      onRemoveCoupon()
    }
    setLoading(false)
  }
  
  function handleRemoveCoupon() {
    setCouponCode('')
    setAppliedCoupon(null)
    setError('')
    onRemoveCoupon()
  }

  return (
    <div className="mt-4 border-t pt-4">
      <h3 className="text-lg font-medium mb-2">Cupom de desconto</h3>
      
      {error && (
        <div className="text-red-600 text-sm mb-2">{error}</div>
      )}
      
      {appliedCoupon ? (
        <div className="flex items-center justify-between bg-green-50 p-3 rounded border border-green-200">
          <div>
            <span className="font-medium">Cupom aplicado: </span>
            <span className="uppercase">{appliedCoupon.code}</span>
            <p className="text-sm text-green-700">
              {appliedCoupon.type === 'PERCENTAGE' 
                ? `${appliedCoupon.discount}% de desconto` 
                : `R$ ${appliedCoupon.discount.toFixed(2)} de desconto`}
            </p>
          </div>
          <button 
            onClick={handleRemoveCoupon}
            className="text-red-600 hover:text-red-800 text-sm"
          >
            Remover
          </button>
        </div>
      ) : (
        <div className="flex space-x-2">
          <input
            type="text"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            placeholder="Digite o código do cupom"
            className="flex-1 p-2 border rounded"
            disabled={loading}
          />
          <button
            onClick={handleApplyCoupon}
            disabled={loading || !couponCode.trim()}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Aplicando...' : 'Aplicar'}
          </button>
        </div>
      )}
    </div>
  )
}
