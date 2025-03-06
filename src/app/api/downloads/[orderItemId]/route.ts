import  prisma  from '@/lib/prisma'
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

  try {
    const orderItem = await prisma.orderItem.findFirst({
      where: {
        id: parseInt(params.orderItemId),
        order: {
          user: {
            email: session.user.email
          }
        }
      },
      include: {
        product: true
      }
    })

    if (!orderItem) {
      return NextResponse.json({ error: 'Item não encontrado' }, { status: 404 })
    }

    if (!orderItem.product.profileFile) {
      return NextResponse.json({ error: 'Arquivo não disponível' }, { status: 404 })
    }

    // Retorna o conteúdo do arquivo
    return new NextResponse(orderItem.product.profileFile, {
      headers: {
        'Content-Type': 'text/plain',
        'Content-Disposition': `attachment; filename="profile-${orderItem.product.id}.txt"`
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