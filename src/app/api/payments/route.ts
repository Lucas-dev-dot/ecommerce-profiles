import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { MercadoPagoConfig, Preference } from 'mercadopago'

const client = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN! 
})

export async function POST(request: Request) {
  const session = await getServerSession()
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const { amount } = await request.json()
    
    const preference = new Preference(client)
    const response = await preference.create({
      body: {
        items: [{
            title: 'Adicionar Saldo',
            unit_price: Number(amount),
            quantity: 1,
            id: ''
        }],
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?status=success`,
          failure: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?status=failure`
        },
        auto_return: 'approved'
      }
    })

    return NextResponse.json({ init_point: response.init_point })
  } catch (error) {
    console.error('Payment error:', error)
    return NextResponse.json({ error: 'Erro ao criar pagamento' }, { status: 500 })
  }
}

