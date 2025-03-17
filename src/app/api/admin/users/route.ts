import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await getServerSession()
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  try {
    // Verificar se o usuário é admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { isAdmin: true }
    })

    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
    }

    // Buscar todos os usuários com contagem de pedidos
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        balance: true,
        isAdmin: true,
        createdAt: true,
        _count: {
          select: { orders: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Formatar os dados para JSON
    const formattedUsers = users.map(user => ({
      ...user,
      balance: Number(user.balance)
    }))

    return NextResponse.json(formattedUsers)
  } catch (error) {
    console.error('Erro ao buscar usuários:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar usuários' },
      { status: 500 }
    )
  }
}
