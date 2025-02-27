module.exports = {
  callbacks: {
    async adapter(adapter) {
      return {
        async getSessionAndUser(sessionToken) {
          const { session, user } = await adapter.getSessionAndUser(sessionToken);
          return { session, user };
        },
      };
    },
  },
};