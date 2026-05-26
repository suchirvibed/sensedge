// Edge-safe NextAuth config. Imported by middleware so we don't pull
// Prisma/bcrypt into the Edge runtime. The real provider lives in auth.ts.
import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [], // populated in auth.ts
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // these fields come from the credentials authorize() in auth.ts
        token.id = (user as { id?: string }).id ?? token.id;
        // role is attached in auth.ts
        const role = (user as { role?: string }).role;
        if (role) (token as Record<string, unknown>).role = role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const u = session.user as unknown as Record<string, unknown>;
        u.id = token.id as string;
        u.role = (token as unknown as Record<string, unknown>).role;
      }
      return session;
    },
  },
};
