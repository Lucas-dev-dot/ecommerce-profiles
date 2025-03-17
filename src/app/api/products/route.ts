import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') as 'PROFILE' | 'PROXY' | null // Pode ser 'PROFILE', 'PROXY' ou null (para todos)
  
  try {
    const whereClause = type ? { type } : {}
    
    const products = await prisma.product.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        price: true,
        description: true,
        type: true,
        imageUrl: true,
        _count: {
          select: {
            stock: {
              where: {
                isUsed: false
              }
            }
          }
        }
      },
      distinct: ['id'] // Ensures no duplicate products
    })

    const formattedProducts = products.map(product => ({
      ...product,
      price: Number(product.price),
      stock: product._count.stock
    }))

    return NextResponse.json(formattedProducts)
  } catch (error) {
    console.error('Erro na API:', error)
    return NextResponse.json(
      { error: 'Erro ao carregar produtos' },
      { status: 500 }
    )
  }
}