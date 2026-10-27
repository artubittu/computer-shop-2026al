import { betterAuth } from "better-auth";
import { prismaAdapter } from "@better-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

const githubClientId = process.env.GITHUB_CLIENT_ID;
const githubClientSecret = process.env.GITHUB_CLIENT_SECRET;

if (!githubClientId || !githubClientSecret) {
  throw new Error(
    "GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET must be defined"
  );
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  session: {
    cookieCache: {
      enabled: false,
    },
  },

  socialProviders: {
    github: {
      clientId: githubClientId,
      clientSecret: githubClientSecret,
      scope: ["user:email"],
    },
  },
});