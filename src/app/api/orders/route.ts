import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'

interface OrderItem {
  productId: number
  quantity: number
  price: number
}

export async function POST(request: Request) {
  const session = await getServerSession()
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const { items, totalAmount } = await request.json()

    // Verificar se algum produto já foi usado
    const products = await prisma.product.findMany({
      where: {
        id: {
          in: items.map((item: any) => item.productId)
        }
      },
      // Não use select para obter todos os campos, incluindo isUsed
    })

    const usedProducts = products.filter((product: any) => product.isUsed === true)
    if (usedProducts.length > 0) {
      return NextResponse.json({
        error: 'Um ou mais perfis já foram vendidos. Por favor, atualize seu carrinho.'
      }, { status: 400 })
    }

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    // Verificar saldo
    if (user.balance < totalAmount) {
      return NextResponse.json({ error: 'Saldo insuficiente' }, { status: 400 })
    }

    // Criar pedido e atualizar produtos em uma transação
    const order = await prisma.$transaction(async (tx) => {
      // Criar pedido
      const newOrder = await tx.order.create({
        data: {
          userId: user.id,
          totalAmount,
          status: 'COMPLETED',
          orderItems: {
            create: items.map((item: any) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price
            }))
          }
        },
        include: {
          orderItems: {
            include: {
              product: true
            }
          }
        }
      })

      // Atualizar saldo do usuário
      await tx.user.update({
        where: { id: user.id },
        data: {
          balance: {
            decrement: totalAmount
          }
        }
      })

      // Marcar produtos como usados
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            ...{ isUsed: true, userId: user.id } as any
          }
        })
      }

      return newOrder
    })

    return NextResponse.json(order)
  } catch (error) {
    console.error('Erro ao criar pedido:', error)
    return NextResponse.json(
      { error: 'Erro ao processar pedido' },
      { status: 500 }
    )
  }
}

export async function GET() {
  const session = await getServerSession()
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const orders = await prisma.order.findMany({
      where: {
        user: {
          email: session.user.email
        }
      },
      include: {
        orderItems: {
          include: {
            product: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error)
    return NextResponse.json(
      { error: 'Erro ao carregar pedidos' },
      { status: 500 }
    )
  }
} 