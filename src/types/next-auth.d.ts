import 'next-auth'

declare module 'next-auth' {
  interface User {
    isAdmin: boolean
  }
  
  interface Session {
    user: {
      id: string
      isAdmin: boolean
    } & DefaultSession['user']
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    isAdmin: boolean
  }
} 