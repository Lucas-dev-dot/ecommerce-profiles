'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

interface Coupon {
  id: number
  code: string
  discount: number
  type: 'PERCENTAGE' | 'FIXED'
  maxUses: number
  usedCount: number
  expiresAt: string | null
  productId: number | null
  product?: {
    name: string
  }
}

export default function ManageCoupons() {
  const { data: session } = useSession()
  const router = useRouter()
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [products, setProducts] = useState<any[]>([])
  
  const [formData, setFormData] = useState<{
    id?: number;
    code: string;
    discount: number;
    type: string;
    maxUses: number;
    expiresAt: string;
    productId: string;
  }>({
    code: '',
    discount: 0,
    type: 'PERCENTAGE',
    maxUses: 1,
    expiresAt: '',
    productId: ''
  })

  useEffect(() => {
    if (!session?.user?.isAdmin) {
      router.push('/')
      return
    }

    loadCoupons()
    loadProducts()
  }, [session, router])

  async function loadCoupons() {
    try {
      const response = await fetch('/api/admin/coupons')
      if (!response.ok) throw new Error('Erro ao carregar cupons')
      const data = await response.json()
      setCoupons(data)
    } catch (error) {
      setError('Erro ao carregar cupons')
    } finally {
      setLoading(false)
    }
  }

  async function loadProducts() {
    try {
      const response = await fetch('/api/admin/products')
      if (!response.ok) throw new Error('Erro ao carregar produtos')
      const data = await response.json()
      setProducts(data)
    } catch (error) {
      console.error('Erro ao carregar produtos:', error)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    try {
      const method = formData.id ? 'PUT' : 'POST';
      const url = formData.id ? `/api/admin/coupons/${formData.id}` : '/api/admin/coupons';
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          discount: Number(formData.discount),
          maxUses: Number(formData.maxUses),
          productId: formData.productId ? Number(formData.productId) : null
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao processar cupom')
      }

      setFormData({
        code: '',
        discount: 0,
        type: 'PERCENTAGE',
        maxUses: 1,
        expiresAt: '',
        productId: ''
      })
      setShowForm(false)
      loadCoupons()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao processar cupom')
    }
  }

  async function handleDeleteCoupon(id: number) {
    if (!confirm('Tem certeza que deseja excluir este cupom?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/coupons/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Erro ao excluir cupom')
      }

      loadCoupons()
    } catch (error) {
      setError('Erro ao excluir cupom')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0e0122] to-[#11052c] flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0e0122] to-[#11052c] py-8">
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Gerenciar Cupons</h1>
            <div className="w-32 h-1 bg-[#2c2979]"></div>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-[#2c2979] text-white px-4 py-2 rounded hover:bg-[#2c2979]/80 transition-colors"
          >
            {showForm ? 'Cancelar' : 'Novo Cupom'}
          </button>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-400/30 text-red-300 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {showForm && (
          <div className="bg-[#161243] p-6 rounded-lg shadow-lg mb-6 border border-[#2c2979]/30">
            <h2 className="text-xl font-semibold mb-4 text-white">
              {formData.id ? 'Editar Cupom' : 'Novo Cupom'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="code">
                  Código do Cupom
                </label>
                <input
                  id="code"
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-3 py-2 bg-[#11052c] border border-[#2c2979]/30 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#2c2979]"
                  required
                  placeholder="Ex: DESCONTO20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="type">
                  Tipo de Desconto
                </label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 bg-[#11052c] border border-[#2c2979]/30 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#2c2979]"
                  required
                  title="Selecione o tipo de desconto"
                >
                  <option value="PERCENTAGE">Percentual (%)</option>
                  <option value="FIXED">Valor Fixo (R$)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="discount">
                  {formData.type === 'PERCENTAGE' ? 'Desconto (%)' : 'Desconto (R$)'}
                </label>
                <input
                  id="discount"
                  type="number"
                  value={formData.discount}
                  onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 bg-[#11052c] border border-[#2c2979]/30 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#2c2979]"
                  min="0"
                  step={formData.type === 'PERCENTAGE' ? "1" : "0.01"}
                  max={formData.type === 'PERCENTAGE' ? "100" : undefined}
                  required
                  placeholder="Digite o valor do desconto"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="maxUses">
                  Número Máximo de Usos
                </label>
                <input
                  id="maxUses"
                  type="number"
                  value={formData.maxUses}
                  onChange={(e) => setFormData({ ...formData, maxUses: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 bg-[#11052c] border border-[#2c2979]/30 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#2c2979]"
                  min="1"
                  required
                  placeholder="Digite o número máximo de usos"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="expiresAt">
                  Data de Expiração (opcional)
                </label>
                <input
                  id="expiresAt"
                  type="datetime-local"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                  className="w-full px-3 py-2 bg-[#11052c] border border-[#2c2979]/30 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#2c2979]"
                  title="Data de expiração do cupom"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="productId">
                  Produto Específico (opcional)
                </label>
                <select
                  id="productId"
                  value={formData.productId}
                  onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                  className="w-full px-3 py-2 bg-[#11052c] border border-[#2c2979]/30 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#2c2979]"
                  title="Selecione um produto específico"
                >
                  <option value="">Todos os produtos</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-[#2c2979] text-white px-4 py-2 rounded hover:bg-[#2c2979]/80 transition-colors"
                >
                  Salvar
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-[#161243] rounded-lg shadow-lg overflow-hidden border border-[#2c2979]/30">
          <table className="min-w-full divide-y divide-[#2c2979]/30">
            <thead className="bg-[#11052c]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Código
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Desconto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Usos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Expiração
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Produto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2c2979]/30">
              {coupons.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-300">
                    Nenhum cupom encontrado
                  </td>
                </tr>
              ) : (
                coupons.map((coupon) => (
                  <tr key={coupon.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">{coupon.code}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">
                        {coupon.type === 'PERCENTAGE'
                          ? `${coupon.discount}%`
                          : `R$ ${coupon.discount.toFixed(2)}`}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">
                        {coupon.usedCount} / {coupon.maxUses}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">
                        {coupon.expiresAt
                          ? new Date(coupon.expiresAt).toLocaleDateString('pt-BR')
                          : 'Sem expiração'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">
                        {coupon.product?.name || 'Todos os produtos'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => {
                          setFormData({
                            ...coupon,
                            productId: coupon.productId?.toString() || '',
                            expiresAt: coupon.expiresAt
                              ? new Date(coupon.expiresAt).toISOString().slice(0, 16)
                              : '',
                          });
                          setShowForm(true);
                        }}
                        className="text-[#2c2979] hover:text-[#2c2979]/80 mr-4 transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteCoupon(coupon.id)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
