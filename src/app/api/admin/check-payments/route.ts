import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { checkPendingPayments } from '@/lib/checkPedingPayments';


export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    
    await checkPendingPayments();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao verificar pagamentos:', error);
    return NextResponse.json({ error: 'Erro ao verificar pagamentos' }, { status: 500 });
  }
}
