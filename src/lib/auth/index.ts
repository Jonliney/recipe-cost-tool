import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { organization } from "better-auth/plugins";

import { appConfig } from "@/lib/config/app";
import { db } from "@/lib/db/client";
import * as schema from "@/lib/db/schema";
import { env } from "@/lib/env";
import { logAuthEmail } from "./email";

export const auth = betterAuth({
  appName: appConfig.name,
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    async sendResetPassword({ user, url }) {
      await logAuthEmail({
        action: "password-reset",
        recipient: user.email,
        url,
        subject: "Reset your password",
      });
    },
  },
  plugins: [
    organization({
      invitationExpiresIn: 60 * 60 * 24 * 7,
      async sendInvitationEmail(data) {
        const invitationUrl = new URL("/accept-invitation", env.BETTER_AUTH_URL);
        invitationUrl.searchParams.set("invitationId", data.id);

        await logAuthEmail({
          action: "invitation",
          recipient: data.email,
          url: invitationUrl.toString(),
          subject: `Invitation to join ${data.organization.name}`,
        });
      },
    }),
    nextCookies(),
  ],
});
