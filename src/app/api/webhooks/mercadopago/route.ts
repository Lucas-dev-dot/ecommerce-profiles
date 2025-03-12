import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { MercadoPagoConfig, Payment } from 'mercadopago'

const client = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN! 
})

export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    if (data.type === 'payment' && data.data.id) {
      const payment = new Payment(client)
      const paymentInfo = await payment.get({ id: data.data.id })
      
      if (paymentInfo.status === 'approved') {
        await prisma.user.update({
          where: { email: paymentInfo.external_reference },
          data: {
            balance: {
              increment: paymentInfo.transaction_amount
            }
          }
        })
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
