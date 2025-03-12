import  prisma  from '@/lib/prisma'
import { hash } from 'bcryptjs'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { token, newPassword } = await req.json()
    console.log('Received token:', token) // Debug log

    const user = await prisma.user.findFirst({
      where: { resetToken: token }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Token not found' },
        { status: 400 }
      )
    }

    const hashedPassword = await hash(newPassword, 10)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Update error:', error)
    return NextResponse.json(
      { error: 'Failed to update password' },
      { status: 500 }
    )
  }
}
