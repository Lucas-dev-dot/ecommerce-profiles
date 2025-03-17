import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  console.log('ID recebido:', params.id);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  // Verificar se é admin
  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email }
  })

  if (!currentUser?.isAdmin) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  try {
    const userId = parseInt(params.id)
    
    if (isNaN(userId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        balance: true,
        isAdmin: true,
        createdAt: true,
        // Não retornar a senha por segurança
        _count: {
          select: {
            orders: true,
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Erro ao buscar usuário:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar usuário' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  // Verificar se é admin
  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email }
  })

  if (!currentUser?.isAdmin) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  try {
    const userId = parseInt(params.id)
    console.log('ID convertido:', parseInt(params.id));
    
    if (isNaN(userId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
    }

    const data = await request.json()
    
    // Validar dados
    if (!data.name || !data.email) {
      return NextResponse.json(
        { error: 'Dados incompletos' },
        { status: 400 }
      )
    }

    // Atualizar usuário
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        email: data.email,
        balance: data.balance !== undefined ? parseFloat(data.balance) : undefined,
        isAdmin: data.isAdmin !== undefined ? data.isAdmin : undefined,
      },
      select: {
        id: true,
        name: true,
        email: true,
        balance: true,
        isAdmin: true,
        createdAt: true,
      }
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar usuário' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  // Verificar se é admin
  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email }
  })

  if (!currentUser?.isAdmin) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  try {
    const userId = parseInt(params.id)
    
    if (isNaN(userId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
    }

    // Verificar se o usuário existe
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    // Não permitir excluir a si mesmo
    if (user.email === session.user.email) {
      return NextResponse.json(
        { error: 'Não é possível excluir seu próprio usuário' },
        { status: 400 }
      )
    }

    // Excluir usuário
    await prisma.user.delete({
      where: { id: userId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao excluir usuário:', error)
    return NextResponse.json(
      { error: 'Erro ao excluir usuário' },
      { status: 500 }
    )
  }
}
