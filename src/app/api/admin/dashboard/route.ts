import prisma from '@/lib/prisma'
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
      select: { isAdmin: true }
    })

    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const [totalUsers, totalOrders, totalRevenue, totalProfiles] = await Promise.all([
      prisma.user.count({
        where: { isAdmin: false }
      }),
      prisma.order.count(),
      prisma.order.aggregate({
        _sum: {
          totalAmount: true
        }
      }),
      prisma.product.count({
        where: { type: 'PROFILE' }
      })
    ])

    return NextResponse.json({
      totalUsers,
      totalOrders,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      totalProfiles
    })
  } catch (error) {
    console.error('Erro ao carregar estatísticas:', error)
    return NextResponse.json(
      { error: 'Erro ao carregar estatísticas' },
      { status: 500 }
    )
  }
}
