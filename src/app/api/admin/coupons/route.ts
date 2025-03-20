import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Listar todos os cupons
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    
    const coupons = await prisma.coupon.findMany({
      include: {
        product: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return NextResponse.json(coupons);
  } catch (error) {
    console.error('Erro ao listar cupons:', error);
    return NextResponse.json({ error: 'Erro ao listar cupons' }, { status: 500 });
  }
}

// Criar um novo cupom
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
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
    
    // Verificar se já existe um cupom com o mesmo código
    const existingCoupon = await prisma.coupon.findFirst({
      where: {
        code: code.toUpperCase(),
      },
    });
    
    if (existingCoupon) {
      return NextResponse.json({ error: 'Já existe um cupom com este código' }, { status: 400 });
    }
    
    // Criar o cupom
    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        discount,
        type: type as any, // Use 'any' to avoid type issues
        maxUses: maxUses || 1,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        productId: productId || null,
      },
    });
    
    return NextResponse.json(coupon);
  } catch (error) {
    console.error('Erro ao criar cupom:', error);
    return NextResponse.json({ error: 'Erro ao criar cupom' }, { status: 500 });
  }
}
