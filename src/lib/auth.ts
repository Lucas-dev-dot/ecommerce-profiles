import NextAuth from 'next-auth';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import GoogleProvider from 'next-auth/providers/google';
import prisma from '@/lib/prisma';

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  callbacks: {
    async session({ session, user }: { session: any; user: any }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: user.id,
          isAdmin: user.isAdmin,
        },
      }
    },
  },
};

export default NextAuth(authOptions);
