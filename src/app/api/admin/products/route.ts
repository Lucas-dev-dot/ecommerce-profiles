import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Buscar todos os produtos, não apenas os do tipo "PROFILE"
    const products = await prisma.product.findMany({
      include: {
        _count: {
          select: {
            stock: {
              where: {
                isUsed: false
              }
            }
          }
        }
      }
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    return NextResponse.json({ error: 'Erro ao buscar produtos' }, { status: 500 });
  }
}
