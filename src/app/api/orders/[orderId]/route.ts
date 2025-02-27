import   prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { orderId: string } }
) {
  const session = await getServerSession()
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: parseInt(params.orderId) },
      include: {
        orderitem: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                type: true
              }
            }
          }
        }
      }
    })

    if (!order) {
      return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 })
    }

    // Adicionar URLs de download para os perfis
    const orderWithDownloads = {
      ...order,
      orderItems: order.orderitem.map((item: { product: { type: string }; id: any }) => ({
        ...item,
        downloadUrl: item.product.type === 'PROFILE' 
          ? `/api/downloads/${item.id}` // URL para download do perfil
          : undefined
      }))
    }

    return NextResponse.json(orderWithDownloads)
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao carregar pedido' },
      { status: 500 }
    )
  }
} 