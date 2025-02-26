import { prisma } from '@/src/lib/prisma'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await getServerSession()
  
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const users = await prisma.user.findMany({
      where: {
        isAdmin: false // Excluir admins da lista
      },
      include: {
        orders: {
          include: {
            orderItems: {
              include: {
                product: true
              }
            }
          }
        },
        products: true // Produtos comprados pelo usuário
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