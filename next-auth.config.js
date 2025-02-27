import NextAuth from 'next-auth';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default NextAuth({
  // Configure one or more authentication providers
  adapter: PrismaAdapter(prisma),
  providers: [
    Providers.Credentials({
      // The name to display on the sign in form (e.g. 'Sign in with...')
      name: 'Credentials',
      // The credentials is used to generate a suitable form on pages/api/auth/signin
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        // Add logic here to look up the user from the credentials supplied
        const user = { id: 1, name: 'J Smith', email: 'jsmith@example.com' };

        if (user) {
          return user;
        } else {
          return null;
        }
      }
    })
  ],
  // Database optional. MySQL, PostgreSQL, MongoDB, FaunaDB, SQL Server
  database: process.env.DATABASE_URL,

  // The secret should be set to a reasonably long random string.
  // It is used to sign the session cookie and verify its integrity.
  // If you don't set it, NextAuth will generate a random secret for you.
  secret: process.env.SECRET,

  // You can set a custom session max age in seconds.
  // The default is 30 minutes.
  session: {
    jwt: true,
    maxAge: 30 * 60
  },

  // You can set a custom callback to handle errors.
  // The callback will be called with the error as an argument.
  callbacks: {
    async jwt(token, user, account, profile, isNewUser) {
      // Persist the user ID to the token right after signin
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session(session, token) {
      // Send properties to the client, like an access token from a provider.
      session.user.id = token.id;
      return session;
    }
  }
});