import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Obter um cupom específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    
    const couponId = parseInt(params.id);
    
    if (isNaN(couponId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }
    
    const coupon = await prisma.coupon.findUnique({
      where: {
        id: couponId,
      },
      include: {
        product: {
          select: {
            name: true,
          },
        },
      },
    });
    
    if (!coupon) {
      return NextResponse.json({ error: 'Cupom não encontrado' }, { status: 404 });
    }
    
    return NextResponse.json(coupon);
  } catch (error) {
    console.error('Erro ao obter cupom:', error);
    return NextResponse.json({ error: 'Erro ao obter cupom' }, { status: 500 });
  }
}

// Atualizar um cupom
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    
    const couponId = parseInt(params.id);
    
    if (isNaN(couponId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }
    
    const body = await request.json();
    const { code, discount, type, maxUses, expiresAt, productId } = body;
    
    // Validações
    if (!code) {
      return NextResponse.json({ error: 'Código do cupom é obrigatório' }, { status: 400 });
    }
    
    if (discount === undefined || discount < 0) {
      return NextResponse.json({ error: 'Desconto inválido' }, { status: 400 });
    }
    
    if (type !== 'PERCENTAGE' && type !== 'FIXED') {
      return NextResponse.json({ error: 'Tipo de desconto inválido' }, { status: 400 });
    }
    
    if (type === 'PERCENTAGE' && discount > 100) {
      return NextResponse.json({ error: 'Desconto percentual não pode ser maior que 100%' }, { status: 400 });
    }
    
    // Verificar se o cupom existe
    const existingCoupon = await prisma.coupon.findUnique({
      where: {
        id: couponId,
      },
    });
    
    if (!existingCoupon) {
      return NextResponse.json({ error: 'Cupom não encontrado' }, { status: 404 });
    }
    
    // Verificar se já existe outro cupom com o mesmo código
    const duplicateCoupon = await prisma.coupon.findFirst({
      where: {
        code: code.toUpperCase(),
        id: {
          not: couponId,
        },
      },
    });
    
    if (duplicateCoupon) {
      return NextResponse.json({ error: 'Já existe outro cupom com este código' }, { status: 400 });
    }
    
    // Atualizar o cupom
    const updatedCoupon = await prisma.coupon.update({
      where: {
        id: couponId,
      },
      data: {
        code: code.toUpperCase(),
        discount,
        type: type as 'PERCENTAGE' | 'FIXED',
        maxUses: maxUses || 1,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        productId: productId || null,
      },
    });
    
    return NextResponse.json(updatedCoupon);
  } catch (error) {
    console.error('Erro ao atualizar cupom:', error);
    return NextResponse.json({ error: 'Erro ao atualizar cupom' }, { status: 500 });
  }
}

// Excluir um cupom
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    
    const couponId = parseInt(params.id);
    
    if (isNaN(couponId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }
    
    // Verificar se o cupom existe
    const existingCoupon = await prisma.coupon.findUnique({
      where: {
        id: couponId,
      },
    });
    
    if (!existingCoupon) {
      return NextResponse.json({ error: 'Cupom não encontrado' }, { status: 404 });
    }
    
    // Excluir o cupom
    await prisma.coupon.delete({
      where: {
        id: couponId,
      },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao excluir cupom:', error);
    return NextResponse.json({ error: 'Erro ao excluir cupom' }, { status: 500 });
  }
}
