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
    user: {
      create: {
        after: async (user) => {
          if (user.role === "patient") {
            try {
              const existing = await prisma.patient.findUnique({ where: { userId: user.id } });
              if (!existing) {
                const count = await prisma.patient.count();
                const patientNumber = `HMS-${String(count + 1).padStart(6, '0')}`;
                await prisma.patient.create({
                  data: {
                    userId: user.id,
                    patientNumber,
                    fullName: user.name,
                    gender: "OTHER",
                    dateOfBirth: new Date("2000-01-01"),
                  },
                });
              }
            } catch (err) {
              console.error("[Auth Hook Error] Failed to auto-create patient:", err);
            }
          }
        },
      },
    },
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
