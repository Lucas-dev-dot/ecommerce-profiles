import { OrderItem } from "@prisma/client"
import { getServerSession } from "next-auth"
import { NextRequest, NextResponse } from "next/server"
import prisma from '@/lib/prisma'
import { authOptions } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    
    const body = await request.json();
    const { items, totalAmount, couponCode } = body;
    
    // Buscar o usuário
    const user = await prisma.user.findUnique({
      where: { email: session.user?.email as string },
    });
    
    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }
    
    // Verificar saldo
    if (Number(user.balance) < totalAmount) {
      return NextResponse.json({ error: 'Saldo insuficiente' }, { status: 400 });
    }
    
    // Processar cupom se fornecido
    let coupon = null;
    if (couponCode) {
      coupon = await prisma.coupon.findFirst({
        where: { code: couponCode.toUpperCase() }
      });
      
      if (coupon) {
        // Incrementar o contador de uso do cupom
        await prisma.coupon.update({
          where: { id: coupon.id },
          data: { usedCount: { increment: 1 } }
        });
      }
    }
    
    // Criar o pedido
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        totalAmount,
        status: 'COMPLETED',
        couponId: coupon?.id || null,
        orderitem: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
    });
    
    // Atualizar o saldo do usuário
    await prisma.user.update({
      where: { id: user.id },
      data: { balance: { decrement: totalAmount } },
    });
    
    // Marcar os itens de estoque como usados
    for (const item of items) {
      const stockItem = await prisma.stock.findFirst({
        where: {
          productId: item.productId,
          isUsed: false,
        },
      });

      if (stockItem) {
        await prisma.stock.update({
          where: { id: stockItem.id },
          data: { 
            isUsed: true,
            userId: user.id,
          },
        });
      }
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Erro ao criar pedido:', error);
    return NextResponse.json({ error: 'Erro ao criar pedido' }, { status: 500 });
  }
}