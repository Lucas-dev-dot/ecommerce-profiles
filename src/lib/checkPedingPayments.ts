import prisma from '@/lib/prisma';
import { getPixChargeStatus } from '@/lib/openpix';

export async function checkPendingPayments() {
  try {
    // Buscar transações pendentes que ainda não expiraram
    const pendingTransactions = await prisma.transaction.findMany({
      where: {
        status: 'PENDING',
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    for (const transaction of pendingTransactions) {
      try {
        // Verificar o status da cobrança na OpenPix
        const chargeStatus = await getPixChargeStatus(transaction.transactionId);
        
        if (chargeStatus.status === 'COMPLETED' || chargeStatus.status === 'CONFIRMED') {
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
          
          console.log(`Transação ${transaction.id} processada com sucesso`);
        } else if (chargeStatus.status === 'EXPIRED') {
          // Marcar a transação como expirada
          await prisma.transaction.update({
            where: { id: transaction.id },
            data: { status: 'EXPIRED' },
          });
          
          console.log(`Transação ${transaction.id} expirada`);
        }
      } catch (error) {
        console.error(`Erro ao processar transação ${transaction.id}:`, error);
      }
    }
    
    console.log('Verificação de pagamentos pendentes concluída');
  } catch (error) {
    console.error('Erro ao verificar pagamentos pendentes:', error);
  }
}
