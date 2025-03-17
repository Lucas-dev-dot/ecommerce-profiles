import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'

// Add balance to user
export async function POST(
  request: Request,
  { params }: { params: { userId: string } }
) {
  const session = await getServerSession()
  
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const { amount } = await request.json()
    const userId = parseInt(params.userId)

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        balance: {
          increment: amount
        }
      }
    })

    return NextResponse.json(user)
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao adicionar saldo' },
      { status: 500 }
    )
  }
}

// Update user status (block/unblock)
// export async function PATCH(
//   request: Request,
//   { params }: { params: { userId: string } }
// ) {
//   const session = await getServerSession()
  
//   if (!session?.user?.isAdmin) {
//     return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
//   }

//   try {
//     const { status } = await request.json()
//     const userId = parseInt(params.userId)

//     const user = await prisma.user.update({
//       where: { id: userId },
//       data: { status }
//     })

//     return NextResponse.json(user)
//   } catch (error) {
//     return NextResponse.json(
//       { error: 'Erro ao atualizar usuário' },
//       { status: 500 }
//     )
//   }
// }
export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  const session = await getServerSession()
  
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const userId = parseInt(params.userId)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        orders: true,
        _count: {
          select: { orders: true }
        }
      }
    })

    return NextResponse.json(user)
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao buscar usuário' },
      { status: 500 }
    )
  }
}
