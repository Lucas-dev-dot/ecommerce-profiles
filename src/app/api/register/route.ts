import  prisma  from '@/lib/prisma'
import { hash } from 'bcryptjs'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json()

    // Verificar se o email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { message: 'Email já cadastrado' },
        { status: 400 }
      )
    }

    // Criar novo usuário
    const hashedPassword = await hash(password, 12)
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        balance: 0,
        isAdmin: false
      }
    })

    return NextResponse.json(
      { message: 'Usuário criado com sucesso' },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json(
      { message: 'Erro ao criar usuário' },
      { status: 500 }
    )
  }
} 