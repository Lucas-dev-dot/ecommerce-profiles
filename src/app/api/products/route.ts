import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { Product } from '@prisma/client'
import Decimal from 'decimal.js';

export async function GET() {
  try {
    console.log('Iniciando busca de produtos...')
    
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        price: true,
        description: true,
        type: true,
      }
    })

    console.log('Produtos encontrados:', products);

    // Ensure `price` is a number
    const productsWithCount = await Promise.all(products.map(async (product) => {
      const stockCount = await prisma.stock.count({
        where: {
          productId: product.id,
          isUsed: false
        }
      });

      return {
        ...product,
        price: Number(product.price),  // Convert Decimal to number
        stockCount,
      };
    }));

    return NextResponse.json(productsWithCount);
  } catch (error) {
    const typedError = error as Error; // Type assertion
    console.error('Erro na API:', typedError.message);
    return NextResponse.json(
      { error: 'Erro ao carregar produtos' },
      { status: 500 }
    )
  }
}
