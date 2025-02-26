import { prisma } from '@/src/lib/prisma'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/src/lib/auth'

export async function GET() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  try {
    const proxies = await prisma.product.findMany({
      where: {
        type: 'PROXY',
        isUsed: false // Apenas proxies disponíveis
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(proxies)
  } catch (error) {
    console.error('Erro ao carregar proxies:', error)
    return NextResponse.json(
      { error: 'Erro ao carregar proxies' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
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

  try {
    const { name, price, proxyContent } = await request.json()

    const proxy = await prisma.product.create({
      data: {
        name,
        price,
        type: 'PROXY',
        profileFile: proxyContent, // Usando o mesmo campo para conteúdo do proxy
        isUsed: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      message: 'Proxy criado com sucesso',
      proxy
    })
  } catch (error) {
    console.error('Erro ao criar proxy:', error)
    return NextResponse.json(
      { error: 'Erro ao criar proxy' },
      { status: 500 }
    )
  }
} 