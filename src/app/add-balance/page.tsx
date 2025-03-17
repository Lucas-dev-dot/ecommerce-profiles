'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { QRCodeSVG } from 'qrcode.react'

export default function AddBalance() {
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [pixData, setPixData] = useState<{
    qrCodeText: string;
    expiresAt: string;
    transactionId: string;
  } | null>(null)
  
  const router = useRouter()
  const { data: session } = useSession()

  if (!session) {
    router.push('/login')
    return null
  }

  async function handleAddBalance(e: React.FormEvent) {
    e.preventDefault()
    
    if (loading || !amount || Number(amount) <= 0) {
      setError('Por favor, insira um valor válido maior que zero')
      return
    }
    
    setLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: Number(amount) }),
      })
  
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao gerar pagamento')
      }
      
      setPixData(data)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao gerar QR Code Pix')
    } finally {
      setLoading(false)
    }
  }

  function handleCopyPixCode() {
    if (pixData?.qrCodeText) {
      navigator.clipboard.writeText(pixData.qrCodeText)
        .then(() => {
          alert('Código Pix copiado para a área de transferência!')
        })
        .catch(err => {
          console.error('Erro ao copiar: ', err)
        })
    }
  }

  function formatExpirationTime(dateString: string) {
    const date = new Date(dateString)
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false
    })
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md mt-8">
      <h1 className="text-2xl font-bold mb-6">Adicionar Saldo</h1>
      
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {!pixData ? (
        <form onSubmit={handleAddBalance} className="space-y-4">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
              Valor (R$)
            </label>
            <input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Digite o valor a adicionar"
              aria-label="Valor em reais"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              min="0"
              step="0.01"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !amount || Number(amount) <= 0}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400"
          >
            {loading ? 'Gerando Pix...' : 'Gerar QR Code Pix'}
          </button>
        </form>
      ) : (
        <div className="text-center space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">
              Escaneie o QR Code abaixo ou copie o código Pix
            </p>
            
            <div className="flex justify-center mb-4">
              {/* Usando o componente QRCodeSVG da biblioteca qrcode.react */}
              <QRCodeSVG 
                value={pixData.qrCodeText} 
                size={256}
                bgColor={"#ffffff"}
                fgColor={"#000000"}
                level={"L"}
                includeMargin={false}
              />
            </div>
            
            <p className="text-xs text-gray-500 mb-2">
              Válido até {formatExpirationTime(pixData.expiresAt)}
            </p>
            
            <button
              onClick={handleCopyPixCode}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
            >
              Copiar Código Pix
            </button>
          </div>
          
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">
              Após o pagamento, seu saldo será atualizado automaticamente.
            </p>
            
            <button
              onClick={() => setPixData(null)}
              className="text-blue-600 hover:underline"
            >
              Gerar novo Pix
            </button>
          </div>
          
          <div className="mt-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-gray-600 hover:underline"
            >
              Voltar para o Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
