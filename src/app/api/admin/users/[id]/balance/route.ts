import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Decimal } from '@prisma/client/runtime/library'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticação
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

    // Obter dados do corpo da requisição
    const body = await request.json()
    console.log('Dados recebidos:', body)
    
    const { amount, operation } = body
    
    // Log para depuração
    console.log('Valor recebido:', amount, typeof amount)
    console.log('Operação recebida:', operation)
    
    // Validar os dados
    if (typeof amount !== 'number' || amount <= 0) {
      console.log('Erro: Valor inválido', amount, typeof amount)
      return NextResponse.json({ error: 'Valor inválido' }, { status: 400 })
    }
    
    if (operation !== 'add' && operation !== 'subtract') {
      console.log('Erro: Operação inválida', operation)
      return NextResponse.json({ error: 'Operação inválida' }, { status: 400 })
    }

    // Buscar usuário atual
    const user = await prisma.user.findUnique({
      where: { id: parseInt(params.id) }
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    // Calcular novo saldo
    let newBalance: Decimal
    
    if (operation === 'add') {
      newBalance = user.balance.add(new Decimal(amount))
    } else {
      // Verificar se há saldo suficiente
      if (user.balance.lessThan(amount)) {
        return NextResponse.json({ error: 'Saldo insuficiente' }, { status: 400 })
      }
      newBalance = user.balance.sub(new Decimal(amount))
    }

    // Atualizar saldo do usuário
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(params.id) },
      data: { balance: newBalance },
      select: {
        id: true,
        name: true,
        email: true,
        balance: true,
        isAdmin: true,
        createdAt: true,
        updatedAt: true,
      }
    })

    return NextResponse.json({
      message: `Saldo ${operation === 'add' ? 'adicionado' : 'subtraído'} com sucesso`,
      user: updatedUser
    })
  } catch (error) {
    console.error('Erro ao atualizar saldo:', error)
    return NextResponse.json({ error: 'Erro ao atualizar saldo' }, { status: 500 })
  }
}
