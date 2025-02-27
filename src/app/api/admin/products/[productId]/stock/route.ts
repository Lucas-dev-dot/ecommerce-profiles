import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from "next-auth/jwt";

// Listar estoque de um produto
export async function GET(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const token = await getToken({ req: request });
    
    if (!token?.email) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: token.email },
      select: { id: true, email: true, isAdmin: true }
    });

    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    const stock = await prisma.stock.findMany({
      where: {
        productId: Number(params.productId),
        isUsed: false
      }
    });

    return NextResponse.json(stock);
  } catch (error) {
    console.error('Erro:', error);
    return NextResponse.json({ error: 'Erro ao buscar estoque' }, { status: 500 });
  }
}

// Adicionar item ao estoque
export async function POST(
  request: Request,
  { params }: { params: { productId: string } }
) {
  try {
    const productId = Number(params.productId);
    console.log(`Verifying product ID: ${productId}`);

    // First verify product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true }  // Only select what we need
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const { content } = await request.json();

    // Create stock with direct productId reference
    const stock = await prisma.stock.create({
      data: {
        productId,  // Direct reference
        content: content.trim(),
        isUsed: false,
        quantity: 1
      }
    });

    return NextResponse.json({
      message: 'Stock created successfully',
      items: [stock]
    });

  } catch (error) {
    console.error('Creation error:', error);
    return NextResponse.json({ error: 'Failed to create stock' }, { status: 500 });
  }
}