import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'

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
      where: { email: session.user.email }
    })

    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
    }

    const productId = parseInt(params.productId)
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 })
    }

    return NextResponse.json({
      profileFile: product.profileFile
    })
  } catch (error) {
    console.error('Erro ao carregar perfil:', error)
    return NextResponse.json(
      { error: 'Erro ao carregar perfil' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: { productId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // Verificar se é admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
    }

    const { profileContent } = await request.json()
    const productId = parseInt(params.productId)

    // Atualizar o produto com o novo conteúdo e resetar o status
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        profileFile: profileContent,
        isUsed: false, // Marca como não usado
        userId: null,  // Remove associação com usuário anterior
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      message: 'Arquivo atualizado com sucesso',
      product: updatedProduct
    })
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar perfil' },
      { status: 500 }
    )
  }
} 