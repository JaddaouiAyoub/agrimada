import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    sessionVersion?: number;
  }
  interface Session {
    sv?: number;
    user: { id: string } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    uid?: string;
    sv?: number;
  }
}
