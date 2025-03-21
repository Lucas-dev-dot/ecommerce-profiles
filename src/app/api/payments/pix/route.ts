import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createPixCharge } from '@/lib/openpix';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    
    const body = await request.json();
    const { amount } = body;
    
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Valor inválido' }, { status: 400 });
    }
    
    // Buscar o usuário
    const user = await prisma.user.findUnique({
      where: { email: session.user?.email as string },
    });
    
    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }
    
    // Gerar um ID de correlação único
    const correlationID = `add-balance-${user.id}-${Date.now()}`;
    
    // Gerar uma cobrança Pix
    const chargeResponse = await createPixCharge({
      correlationID,
      value: Math.round(amount * 100), // Converter para centavos
      comment: `Adição de saldo - ${user.email}`,
      expiresIn: 3600, // Expira em 1 hora (em segundos)
      customer: {
        name: user.name,
        email: user.email,
      },
    });
    
    if (!chargeResponse || !chargeResponse.brCode) {
      throw new Error('Erro ao gerar cobrança Pix');
    }
    
    // Registrar a transação no banco de dados
    const transaction = await prisma.transaction.create({
      data: {
        userId: user.id,
        amount,
        status: 'PENDING',
        type: 'DEPOSIT',
        transactionId: correlationID,
        pixCode: chargeResponse.brCode,
        expiresAt: new Date(Date.now() + 3600 * 1000), // 1 hora a partir de agora
      },
    });
    
    return NextResponse.json({
      qrCodeText: chargeResponse.brCode,
      qrCodeImage: chargeResponse.qrCodeImage,
      expiresAt: transaction.expiresAt,
      transactionId: transaction.transactionId,
    });
    
  } catch (error) {
    console.error('Erro ao gerar pagamento Pix:', error);
    return NextResponse.json({ error: 'Erro ao gerar pagamento Pix' }, { status: 500 });
  }
}
