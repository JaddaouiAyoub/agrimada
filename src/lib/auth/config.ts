import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import { fakeVerify, verifyPassword } from "@/lib/auth/password";
import { ipFromHeaders, isLoginBlocked, recordLoginAttempt } from "@/lib/auth/rate-limit";
import { loginSchema } from "@/lib/validations/auth";

export class RateLimitedError extends CredentialsSignin {
  code = "rate_limited";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(rawCredentials, request) {
        const parsed = loginSchema.safeParse(rawCredentials);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;
        const ip = ipFromHeaders(request.headers);

        if (await isLoginBlocked(email, ip)) throw new RateLimitedError();

        const user = await db.user.findUnique({
          where: { email },
          select: { id: true, name: true, email: true, passwordHash: true, status: true, sessionVersion: true },
        });

        if (!user?.passwordHash || user.status !== "ACTIVE") {
          await fakeVerify(password);
          await recordLoginAttempt(email, ip, false);
          return null;
        }

        const valid = await verifyPassword(user.passwordHash, password);
        await recordLoginAttempt(email, ip, valid);
        if (!valid) return null;

        await db.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
        return { id: user.id, name: user.name, email: user.email, sessionVersion: user.sessionVersion };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user?.id) {
        token.uid = user.id;
        token.sv = user.sessionVersion ?? 0;
      }
      return token;
    },
    session({ session, token }) {
      if (typeof token.uid === "string") session.user.id = token.uid;
      session.sv = typeof token.sv === "number" ? token.sv : -1;
      return session;
    },
  },
});
