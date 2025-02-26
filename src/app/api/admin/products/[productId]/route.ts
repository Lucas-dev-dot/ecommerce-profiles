import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'

// Buscar produto específico
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

    const product = await prisma.product.findUnique({
      where: { id: Number(params.productId) },
      include: {
        _count: {
          select: {
            stock: {
              where: { isUsed: false }
            }
          }
        }
      }
    })

    if (!product) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Erro:', error)
    return NextResponse.json({ error: 'Erro ao buscar produto' }, { status: 500 })
  }
}

// Atualizar produto
export async function PUT(
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
    const product = await prisma.product.update({
      where: { id: Number(params.productId) },
      data: {
        ...data,
        updatedAt: new Date()
      }
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error('Erro:', error)
    return NextResponse.json({ error: 'Erro ao atualizar produto' }, { status: 500 })
  }
}

// Deletar produto
export async function DELETE(
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

    await prisma.product.delete({
      where: { id: Number(params.productId) }
    })

    return NextResponse.json({ message: 'Produto deletado com sucesso' })
  } catch (error) {
    console.error('Erro:', error)
    return NextResponse.json({ error: 'Erro ao deletar produto' }, { status: 500 })
  }
} 