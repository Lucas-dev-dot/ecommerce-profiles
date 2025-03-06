'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

interface OrderItem {
  id: number
  product: {
    id: number
    name: string
    profileFile: string | null
  }
}

export function DownloadProfiles() {
  const { data: session } = useSession()
  const [purchasedItems, setPurchasedItems] = useState<OrderItem[]>([])

  useEffect(() => {
    const fetchPurchases = async () => {
      const response = await fetch('/api/purchases')
      const data = await response.json()
      setPurchasedItems(data)
    }
    fetchPurchases()
  }, [])

  const handleDownload = async (orderItemId: number) => {
    try {
      const response = await fetch(`/api/download/${orderItemId}`)
      if (!response.ok) throw new Error('Erro ao baixar arquivo')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `profile-${orderItemId}.txt`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Erro:', error)
      alert('Erro ao baixar o arquivo')
    }
  }

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Seus Perfis Disponíveis para Download</h2>
      <div className="grid gap-4">
        {purchasedItems.map((item) => (
          <div key={item.id} className="border p-4 rounded-lg shadow">
            <h3 className="font-semibold">{item.product.name}</h3>
            <button
              onClick={() => handleDownload(item.id)}
              className="bg-red-700 text-white px-4 py-2 rounded mt-2 hover:bg-red-800"
            >
              Download Perfil
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
