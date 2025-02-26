import { prisma } from '@/src/lib/prisma'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: { userId: string } }
) {
  const session = await getServerSession()
  
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const { amount } = await request.json()
    const userId = parseInt(params.userId)

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        balance: {
          increment: amount
        }
      }
    })

    return NextResponse.json(user)
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao adicionar saldo' },
      { status: 500 }
    )
  }
} 