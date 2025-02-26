import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { Product, PrismaClient } from '@prisma/client'

interface ProductWithStock extends Product {
  stockCount?: number;
}

export async function GET() {
  try {
    console.log('Iniciando busca de produtos...')
    
    const products = await prisma.product.findMany({
      orderBy: {
        name: 'asc'
      }
    })
    
    // Busque o estoque separadamente
    for (const product of products as ProductWithStock[]) {
      product.stockCount = await prisma.stock.count({
        where: {
          productId: product.id,
          isUsed: false
        }
      })
    }
    
    // Remover possíveis duplicatas usando Set
    const uniqueProducts = Array.from(new Set(products.map((p: { id: number }) => p.id)))
      .map(id => products.find((p: { id: number }) => p.id === id))
    
    console.log('Total de produtos (antes da deduplicação):', products.length)
    console.log('Total de produtos (após deduplicação):', uniqueProducts.length)
    console.log('IDs únicos:', uniqueProducts.map(p => p?.id))

    const productsWithCount = products.map((product: ProductWithStock) => ({
      ...product,
      stock: (product as any).stockCount,
    }))

    return NextResponse.json(productsWithCount)
  } catch (error) {
    console.error('Erro na API:', error)
    return NextResponse.json(
      { error: 'Erro ao carregar produtos' },
      { status: 500 }
    )
  }
} 