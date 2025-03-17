import prisma from "@/lib/prisma";
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { productId: string } }
) {
  const { productId } = params;

  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(productId) },
      include: {
        _count: {
          select: {
            stock: {
              where: { isUsed: false }
            }
          }
        }
      }
    });

    console.log(`Buscando produto com ID: ${productId}`);

    if (!product) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 })
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    return NextResponse.json({ error: 'Erro ao buscar produto' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { productId: string } }
) {
  const { productId } = params;

  try {
    // Obter dados do corpo da requisição
    const data = await request.json();
    
    console.log(`Atualizando produto com ID: ${productId}`, data);
    
    // Atualizar o produto
    const updatedProduct = await prisma.product.update({
      where: { id: parseInt(productId) },
      data: {
        name: data.name,
        description: data.description || '',
        price: parseFloat(data.price),
        // Não atualizamos o tipo do produto para evitar problemas
      }
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    return NextResponse.json({ error: 'Erro ao atualizar produto' }, { status: 500 });
  }
}
