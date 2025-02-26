import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await getServerSession()
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { balance: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    return NextResponse.json({ balance: user.balance })
  } catch (error) {
    console.error('Erro ao buscar saldo:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar saldo' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const session = await getServerSession()
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const { amount } = await request.json()

    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        balance: {
          increment: amount
        }
      },
      select: { balance: true }
    })

    return NextResponse.json({ balance: user.balance })
  } catch (error) {
    console.error('Erro ao atualizar saldo:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar saldo' },
      { status: 500 }
    )
  }
} 