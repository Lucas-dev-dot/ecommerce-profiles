import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Definir interface para os itens do carrinho
interface CartItem {
  productId: number;
  price: number;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    
    const body = await request.json();
    const { code, items } = body;
    
    if (!code) {
      return NextResponse.json({ error: 'Código do cupom é obrigatório' }, { status: 400 });
    }
    
    // Buscar o cupom pelo código
    const coupon = await prisma.coupon.findFirst({
      where: {
        code: code.toUpperCase(),
      },
    });
    
    if (!coupon) {
      return NextResponse.json({ error: 'Cupom não encontrado' }, { status: 404 });
    }
    
    // Verificar se o cupom já atingiu o limite de usos
    if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({ error: 'Cupom já atingiu o limite de usos' }, { status: 400 });
    }
    
    // Verificar se o cupom está expirado
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return NextResponse.json({ error: 'Cupom expirado' }, { status: 400 });
    }
    
    // Verificar se o cupom é específico para um produto
    if (coupon.productId) {
      // Aqui está a correção, adicionando o tipo explícito para o item
      const hasValidProduct = items.some((item: CartItem) => item.productId === coupon.productId);
      
      if (!hasValidProduct) {
        return NextResponse.json({ error: 'Cupom válido apenas para produtos específicos' }, { status: 400 });
      }
    }
    
    // Retornar o cupom válido
    return NextResponse.json({
      coupon: {
        code: coupon.code,
        discount: Number(coupon.discount),
        type: coupon.type,
      }
    });
    
  } catch (error) {
    console.error('Erro ao validar cupom:', error);
    return NextResponse.json({ error: 'Erro ao validar cupom' }, { status: 500 });
  }
}
