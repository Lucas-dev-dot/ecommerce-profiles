import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'

interface OrderItem {
  productId: number
  quantity: number
  price: number
  type: string
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 })
}

export async function POST(request: Request) {
  const session = await getServerSession()
 
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const { items, totalAmount } = await request.json()

    const products = await prisma.product.findMany({
      where: {
        AND: [
          {
            type: {
              in: items.map((item: OrderItem) => item.type)
            }
          },
          {
            isUsed: false
          }
        ]
      }
    })

    const availableCountByType = products.reduce((acc, product) => {
      acc[product.type] = (acc[product.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    for (const item of items) {
      const availableCount = availableCountByType[item.type] || 0
      if (availableCount < item.quantity) {
        return NextResponse.json({
          error: `Quantidade insuficiente disponível para ${item.type}`
        }, { status: 400 })
      }
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    if (user.balance < totalAmount) {
      return NextResponse.json({ error: 'Saldo insuficiente' }, { status: 400 })
    }

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId: user.id,
          totalAmount,
          status: 'COMPLETED',
          orderitem: {
            create: items.map((item: OrderItem) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price
            }))
          }
        },
        include: {
          orderitem: {
            include: {
              product: true
            }
          }
        }
      })

      await tx.user.update({
        where: { id: user.id },
        data: {
          balance: {
            decrement: totalAmount
          }
        }
      })

      for (const item of items) {
        const productsToMark = await tx.product.findMany({
          where: {
            type: item.type,
            isUsed: false
          },
          take: item.quantity
        })

        await tx.product.updateMany({
          where: {
            id: {
              in: productsToMark.map(p => p.id)
            }
          },
          data: {
            isUsed: true,
            userId: user.id
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
