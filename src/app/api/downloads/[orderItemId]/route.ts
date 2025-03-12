import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { orderItemId: string } }
) {
  const session = await getServerSession()
 
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const orderItemId = Number(params.orderItemId)
  if (isNaN(orderItemId)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
  }

  try {
    const orderItem = await prisma.orderItem.findFirst({
      where: {
        id: orderItemId,
        order: {
          user: {
            email: session.user.email
          }
        }
      },
      select: {
        id: true,
        productId: true,
        order: {
          select: {
            user: true
          }
        },
        product: {
          select: {
            stock: {
              where: {
                isUsed: true
              },
              take: 1,
              select: {
                content: true
              }
            }
          }
        }
      }
    })
   
    console.log('Order Item:', orderItem)

    if (!orderItem) {
      return NextResponse.json({ error: 'Item não encontrado' }, { status: 404 })
    }

    if (!orderItem?.product?.stock?.[0]?.content) {
      return NextResponse.json({ error: 'Arquivo não disponível' }, { status: 404 })
    }

    return new NextResponse(orderItem.product.stock[0].content, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="profile-${orderItem.productId}.txt"`
      }
    })
  } catch (error) {
    console.error('Erro ao baixar arquivo:', error)
    return NextResponse.json(
      { error: 'Erro ao baixar arquivo' },
      { status: 500 }
    )
  }
}