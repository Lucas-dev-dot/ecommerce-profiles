import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import crypto from 'crypto'

// Função para gerar um ID de correlação único
function generateCorrelationId(userId: number): string {
  return `add-balance-${userId}-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const { amount } = await request.json()
    
    // Buscar informações do usuário
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, name: true, email: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    // Gerar um ID de correlação único
    const correlationId = generateCorrelationId(user.id)
    
    // Criar uma cobrança Pix usando a API da OpenPix
    const response = await fetch('https://api.openpix.com.br/api/v1/charge', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENPIX_API_KEY}`
      },
      body: JSON.stringify({
        correlationID: correlationId,
        value: Math.round(Number(amount) * 100), // OpenPix usa centavos
        comment: `Adição de saldo - ${user.email}`,
        expiresIn: 3600, // Expira em 1 hora (em segundos)
        customer: {
          name: user.name,
          email: user.email,
          taxID: '000.000.000-00', // CPF do cliente (opcional)
        },
        additionalInfo: [
          {
            key: 'userId',
            value: user.id.toString()
          }
        ]
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('OpenPix API error:', errorData)
      throw new Error('Erro ao criar cobrança Pix')
    }

    const pixData = await response.json()

    // Registrar a transação pendente no banco de dados
    await prisma.transaction.create({
      data: {
        userId: user.id,
        amount: Number(amount),
        status: 'PENDING',
        type: 'DEPOSIT',
        transactionId: correlationId,
        pixCode: pixData.brCode,
        expiresAt: new Date(Date.now() + 3600 * 1000) // 1 hora a partir de agora
      }
    })

    return NextResponse.json({ 
      qrCodeImage: pixData.qrCodeImage,
      qrCodeText: pixData.brCode,
      expiresAt: new Date(Date.now() + 3600 * 1000),
      transactionId: correlationId
    })
  } catch (error) {
    console.error('Payment error:', error)
    return NextResponse.json({ error: 'Erro ao criar pagamento Pix' }, { status: 500 })
  }
}
