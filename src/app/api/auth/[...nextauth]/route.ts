import { prisma } from '@/lib/prisma'
import { compare } from 'bcryptjs'
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Credenciais inválidas')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user) {
          throw new Error('Usuário não encontrado')
        }

        const isValid = await compare(credentials.password, user.password)

        if (!isValid) {
          throw new Error('Senha incorreta')
        }

        return {
          id: user.id.toString(),
          email: user.email,
          name: user.name,
          isAdmin: user.isAdmin
        }
      }
    })
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.sub as string
        session.user.isAdmin = token.isAdmin as boolean
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.isAdmin = user.isAdmin
      }
      return token
    }
  }
})

export { handler as GET, handler as POST } 