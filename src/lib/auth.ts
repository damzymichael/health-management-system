import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";
import { nextCookies } from "better-auth/next-js";

export const prisma = new PrismaClient();

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "mongodb",
  }),
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url, token }) => {
      // Mock sending email
      console.log(`[Email Mock] Send password reset link to ${user.email}: ${url}`);
    },
  },
  user: {
    additionalFields: {
      role: { type: "string", required: true, defaultValue: "patient", input: false },
      isActive: { type: "boolean", required: true, defaultValue: true, input: false },
    },
  },
  databaseHooks: {
    session: {
      create: {
        before: async (session) => {
          // Check if user is active before creating a session
          const user = await prisma.user.findUnique({ where: { id: session.userId } });
          if (user && !user.isActive) {
            throw new Error("ACCOUNT_INACTIVE");
          }
          return { data: session };
        },
      },
    },
  },
  plugins: [
    nextCookies() // must be last in array for server actions
  ]
});
