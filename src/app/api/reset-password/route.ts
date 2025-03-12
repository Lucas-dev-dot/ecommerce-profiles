import  prisma  from '@/lib/prisma'
import { Resend } from 'resend'
import { NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  const { email } = await req.json()
  const resetToken = crypto.randomUUID()

  await prisma.user.update({
    where: { email },
    data: { resetToken }
  })

  await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: email,
    subject: 'Reset Your Password',
    html: `
      <h1>Reset Your Password</h1>
      <p>Click the link below to reset your password:</p>
      <a href="${process.env.NEXTAUTH_URL}/reset-password/${resetToken}">Reset Password</a>
    `
  })

  return NextResponse.json({ success: true })
}
