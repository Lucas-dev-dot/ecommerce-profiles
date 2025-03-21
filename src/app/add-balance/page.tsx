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
      const response = await fetch('/api/payments/pix', {  // URL corrigida
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
    <div className="min-h-screen bg-gradient-to-b from-[#0e0122] to-[#11052c] py-12">
      <div className="max-w-md mx-auto p-6 bg-[#161243] rounded-lg shadow-lg border border-[#2c2979]/30">
        <h1 className="text-2xl font-bold mb-2 text-white">Adicionar Saldo</h1>
        <div className="w-24 h-1 bg-[#2c2979] mb-6"></div>
        
        {error && (
          <div className="mb-4 p-4 bg-red-900/20 text-red-300 rounded border border-red-400/30">
            {error}
          </div>
        )}
        
        {!pixData ? (
          <form onSubmit={handleAddBalance} className="space-y-4">
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-1">
                Valor (R$)
              </label>
              <input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Digite o valor a adicionar"
                aria-label="Valor em reais"
                className="w-full px-3 py-2 bg-[#11052c] border border-[#2c2979]/30 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#2c2979]"
                min="0"
                step="0.01"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !amount || Number(amount) <= 0}
              className="w-full bg-[#2c2979] text-white py-2 px-4 rounded-md hover:bg-[#2c2979]/80 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Gerando Pix...' : 'Gerar QR Code Pix'}
            </button>
          </form>
        ) : (
          <div className="text-center space-y-4">
            <div className="bg-[#11052c] p-4 rounded-lg border border-[#2c2979]/30">
              <p className="text-sm text-gray-300 mb-2">
                Escaneie o QR Code abaixo ou copie o código Pix
              </p>
              
              <div className="flex justify-center mb-4 bg-white p-4 rounded-lg mx-auto max-w-[280px]">
                <QRCodeSVG 
                  value={pixData.qrCodeText} 
                  size={256}
                  bgColor={"#ffffff"}
                  fgColor={"#000000"}
                  level={"L"}
                  includeMargin={false}
                />
              </div>
              
              <p className="text-xs text-gray-300 mb-2">
                Válido até {formatExpirationTime(pixData.expiresAt)}
              </p>
              
              <button
                onClick={handleCopyPixCode}
                className="w-full bg-[#2c2979] text-white py-2 px-4 rounded-md hover:bg-[#2c2979]/80 transition-colors"
              >
                Copiar Código Pix
              </button>
            </div>
            
            <div className="mt-4">
              <p className="text-sm text-gray-300 mb-2">
                Após o pagamento, seu saldo será atualizado automaticamente.
              </p>
              
              <button
                onClick={() => setPixData(null)}
                className="text-[#2c2979] hover:text-[#2c2979]/80 transition-colors"
              >
                Gerar novo Pix
              </button>
            </div>
            
            <div className="mt-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="text-gray-300 hover:text-white transition-colors"
              >
                Voltar para o Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
