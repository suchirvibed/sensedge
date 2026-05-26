import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/auth.config";
import type { Role } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: Role;
    };
  }
  interface User {
    role: Role;
  }
}

// Build provider list. Google is included only if env credentials exist,
// so missing keys never break startup.
const providers: NextAuthConfig["providers"] = [
  Credentials({
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) return null;

      const user = await prisma.user.findUnique({
        where: { email: String(credentials.email) },
      });
      if (!user) return null;

      const ok = await bcrypt.compare(String(credentials.password), user.password);
      if (!ok) return null;

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      };
    },
  }),
];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      // Always ask which Google account to use — better UX than silently
      // re-signing-in with whatever account is in the browser.
      authorization: { params: { prompt: "select_account" } },
    })
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers,
  callbacks: {
    ...authConfig.callbacks,

    /**
     * Runs before sign-in completes. For Google, ensure a User row exists
     * (creating one with an unguessable random password the credentials
     * provider can never match).
     */
    async signIn({ account, profile }) {
      if (account?.provider !== "google") return true;
      const email = profile?.email?.toLowerCase();
      if (!email) return false;

      const existing = await prisma.user.findUnique({ where: { email } });
      if (!existing) {
        const randomPwd = crypto.randomBytes(32).toString("hex");
        await prisma.user.create({
          data: {
            email,
            name: profile?.name ?? email.split("@")[0],
            password: await bcrypt.hash(randomPwd, 10),
            role: "CUSTOMER",
          },
        });
      }
      return true;
    },

    /**
     * Runs on initial sign-in (when `user` is present) and on every
     * subsequent request (where `user` is undefined). We only touch the
     * DB on initial sign-in so the JWT carries our internal id + role
     * regardless of which provider was used.
     */
    async jwt({ token, user, account }) {
      if (!user) return token; // subsequent requests — token already populated

      if (account?.provider === "credentials") {
        // authorize() in Credentials returns our DB shape directly
        const u = user as { id?: string; role?: Role; name?: string | null };
        if (u.id) token.id = u.id;
        if (u.role) (token as Record<string, unknown>).role = u.role;
        if (u.name) token.name = u.name;
      } else if (account?.provider === "google" && user.email) {
        // signIn() already upserted the DB row — look up id + role
        const dbUser = await prisma.user.findUnique({
          where: { email: String(user.email).toLowerCase() },
          select: { id: true, role: true, name: true },
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.name = dbUser.name;
          (token as Record<string, unknown>).role = dbUser.role;
        }
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
});

/** Exported so client code can decide whether to render the Google button. */
export const googleSignInEnabled = Boolean(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
);
