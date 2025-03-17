import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import crypto from 'crypto'

// Função para verificar a assinatura do webhook
function verifyWebhookSignature(signature: string, payload: string, secret: string): boolean {
  const hmac = crypto.createHmac('sha256', secret)
  const expectedSignature = hmac.update(payload).digest('hex')
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  )
}

export async function POST(request: Request) {
  try {
    // Obter o corpo da requisição como texto para verificação da assinatura
    const rawBody = await request.text()
    const payload = JSON.parse(rawBody)
    
    // Obter o cabeçalho de assinatura
    const signature = request.headers.get('x-webhook-signature') || ''
    
    // Verificar a assinatura em produção
    if (process.env.NODE_ENV === 'production') {
      const webhookSecret = process.env.OPENPIX_WEBHOOK_SECRET || ''
      if (!verifyWebhookSignature(signature, rawBody, webhookSecret)) {
        return NextResponse.json({ error: 'Assinatura inválida' }, { status: 401 })
      }
    }
    
    // Processar o evento
    const { event, charge } = payload
    
    if (event === 'CHARGE_COMPLETED') {
      // Encontrar a transação pelo correlationID
      const transaction = await prisma.transaction.findUnique({
        where: { transactionId: charge.correlationID },
        include: { user: true }
      })
      
      if (!transaction) {
        console.error('Transação não encontrada:', charge.correlationID)
        return NextResponse.json({ error: 'Transação não encontrada' }, { status: 404 })
      }
      
      // Atualizar o status da transação
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: 'COMPLETED' }
      })
      
      // Adicionar o saldo ao usuário
      await prisma.user.update({
        where: { id: transaction.userId },
        data: {
          balance: {
            increment: transaction.amount
          }
        }
      })
      
      console.log(`Saldo adicionado para o usuário ${transaction.userId}: R$ ${transaction.amount}`)
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro no webhook da OpenPix:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
