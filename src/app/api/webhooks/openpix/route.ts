import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Verificar a autenticidade do webhook (você pode adicionar mais segurança aqui)
    const signature = request.headers.get('x-webhook-signature');
    
    // Se você quiser validar a assinatura do webhook:
    // if (!validateSignature(signature, await request.text())) {
    //   return NextResponse.json({ error: 'Assinatura inválida' }, { status: 401 });
    // }
    
    const body = await request.json();
    const { event, charge } = body;
    
    // Processar apenas eventos de pagamento concluído
    if (event !== 'PAYMENT_RECEIVED') {
      return NextResponse.json({ success: true });
    }
    
    const correlationID = charge.correlationID;
    
    // Buscar a transação pelo ID de correlação
    const transaction = await prisma.transaction.findUnique({
      where: { transactionId: correlationID },
    });
    
    if (!transaction) {
      console.error('Transação não encontrada:', correlationID);
      return NextResponse.json({ error: 'Transação não encontrada' }, { status: 404 });
    }
    
    // Se a transação já foi processada, ignorar
    if (transaction.status === 'COMPLETED') {
      return NextResponse.json({ success: true });
    }
    
    // Atualizar o status da transação
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: { status: 'COMPLETED' },
    });
    
    // Adicionar o saldo ao usuário
    await prisma.user.update({
      where: { id: transaction.userId },
      data: {
        balance: {
          increment: transaction.amount,
        },
      },
    });
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    return NextResponse.json({ error: 'Erro ao processar webhook' }, { status: 500 });
  }
}
