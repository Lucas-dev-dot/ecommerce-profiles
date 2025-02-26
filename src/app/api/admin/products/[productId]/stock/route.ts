import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'

// Listar estoque de um produto
export async function GET(
  request: Request,
  { params }: { params: { productId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, email: true, isAdmin: true }
    })

    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
    }

    const stock = await prisma.stock.findMany({
      where: {
        productId: Number(params.productId),
        isUsed: false
      }
    })

    return NextResponse.json(stock)
  } catch (error) {
    console.error('Erro:', error)
    return NextResponse.json({ error: 'Erro ao buscar estoque' }, { status: 500 })
  }
}

// Adicionar item ao estoque
export async function POST(
  request: Request,
  { params }: { params: { productId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, email: true, isAdmin: true }
    })

    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
    }

    const data = await request.json()
    const stock = await prisma.stock.create({
      data: {
        productId: Number(params.productId),
        content: data.content,
        isUsed: false
      }
    })

    return NextResponse.json(stock)
  } catch (error) {
    console.error('Erro:', error)
    return NextResponse.json({ error: 'Erro ao adicionar ao estoque' }, { status: 500 })
  }
} 