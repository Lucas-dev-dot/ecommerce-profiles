import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await getServerSession()
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        balance: true,
        createdAt: true,
        isAdmin: true,
        _count: {
          select: {
            orders: true
          }
        }
      },
      where: {
        isAdmin: false
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error('Erro ao carregar usuários:', error)
    return NextResponse.json(
      { error: 'Erro ao carregar usuários' },
      { status: 500 }
    )
  }
}
