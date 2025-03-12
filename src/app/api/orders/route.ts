import { OrderItem } from "@prisma/client"
import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
  const session = await getServerSession()

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const { items, totalAmount } = await request.json()
   
    // First check available stock count
    for (const item of items) {
      const availableStockCount = await prisma.stock.count({
        where: {
          productId: item.productId,
          isUsed: false
        }
      })

      if (availableStockCount < item.quantity) {
        return NextResponse.json({
          error: `Produto ${item.productId} tem apenas ${availableStockCount} unidades disponíveis`
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
            create: await Promise.all(items.map(async (item: OrderItem) => {
              const stockItem = await tx.stock.findFirst({
                where: {
                  productId: item.productId,
                  isUsed: false
                }
              })
      
              if (!stockItem) {
                throw new Error(`No available stock found for product ${item.productId}`)
              }
      
              // Update stock status
              await tx.stock.update({
                where: { id: stockItem.id },
                data: { isUsed: true }
              })
      
              return {
                productId: item.productId,
                quantity: item.quantity,
                price: item.price
              }
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
