import { prisma } from '@/src/lib/prisma'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await getServerSession()
  
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    // Buscar todas as estatísticas em paralelo
    const [users, orders, profiles] = await Promise.all([
      // Total de usuários (excluindo admins)
      prisma.user.count({
        where: {
          isAdmin: false
        }
      }),
      
      // Total de pedidos e receita
      prisma.order.findMany({
        select: {
          totalAmount: true
        }
      }),
      
      // Total de perfis ativos
      prisma.product.count({
        where: {
          type: 'PROFILE',
          profileFile: {
            not: null
          }
        }
      })
    ])

    // Calcular receita total
    const totalRevenue = orders.reduce((sum: number, order: { totalAmount: any }) => 
      sum + Number(order.totalAmount), 0
    )

    return NextResponse.json({
      totalUsers: users,
      totalOrders: orders.length,
      totalRevenue: totalRevenue,
      totalProfiles: profiles
    })
  } catch (error) {
    console.error('Erro ao carregar estatísticas:', error)
    return NextResponse.json(
      { error: 'Erro ao carregar estatísticas' },
      { status: 500 }
    )
  }
} 