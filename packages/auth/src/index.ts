import { db } from "@math-wiz/db";
import { env } from "@math-wiz/env/server";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
// import {createAuthMiddleware} from 'better-auth/api'
import { nextCookies } from "better-auth/next-js";
import { lastLoginMethod } from "better-auth/plugins";
import { twoFactor } from "better-auth/plugins/two-factor";
import { sendEmailVerificationEmail } from "./emails/email-verification";
import * as schema from "@math-wiz/db/schema/auth";
import { sendDeleteAccountVerificationEmail } from "./emails/delete-account-verification";
import { sendPasswordResetEmail } from "./emails/password-reset-email";
// type SignUpBody = {
//   name: string
//   email: string
//   password: string
//   [key: string]: unknown // Allow additional fields
// }

export const auth = betterAuth({
  appName: "My Better T App",
  user: {
    changeEmail: {
      enabled: true,
      sendChangeEmailVerification: async ({ user, url, newEmail }) => {
        await sendEmailVerificationEmail({
          user: { ...user, email: newEmail },
          url,
        });
      },
    },
    deleteUser: {
      enabled: true,
      sendDeleteAccountVerification: async ({ user, url }) => {
        await sendDeleteAccountVerificationEmail({ user, url });
      },
    },
    // additionalFields: {
    //   favoriteNumber: {
    //     type: 'number',
    //     required: true,
    //   },
    // },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      await sendPasswordResetEmail({ user, url });
    },
  },
  emailVerification: {
    autoSignInAfterVerification: true,
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmailVerificationEmail({ user, url });
    },
  },
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      // mapProfileToUser: (profile) => {
      //   return {
      //     favoriteNumber: profile.name.length || 0,
      //   }
      // },
    },
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 1, // 1 minutes
    },
  },
  // hooks: {
  //   after: createAuthMiddleware(async (ctx) => {
  //     if (ctx.path.startsWith('/sign-up')) {
  //       const body = ctx.body as SignUpBody
  //       const user = ctx.context.newSession?.user ?? {
  //         name: body.name,
  //         email: body.email,
  //       }

  //       if (user != null) {
  //         await sendWelcomeEmail(user)
  //       }
  //     }
  //   }),
  // },
  plugins: [
    nextCookies(),
    twoFactor(),
    // adminPlugin({
    //   ac,
    //   roles: {
    //     admin,
    //     user,
    //   },
    // }),
    // organization({
    //   ac: organizationAc,
    //   roles: {
    //     owner,
    //     admin: orgAdmin,
    //     member,
    //   },
    //   sendInvitationEmail: async ({email, organization, inviter, invitation}) => {
    //     await sendOrganizationInviteEmail({
    //       invitation,
    //       inviter: inviter.user,
    //       organization,
    //       email,
    //     })
    //   },
    //   teams: {
    //     enabled: true,
    //     maximumTeams: 10, // Optional: limit teams per organization
    //     allowRemovingAllTeams: false, // Optional: prevent removing the last team
    //   },
    //   allowUserToCreateOrganization: (user) => {
    //     return user.role === 'admin'
    //   },
    //   // Automatically add the creator AND org owners/admins to new teams
    //   organizationHooks: {
    //     afterCreateTeam: async ({team, user, organization: org}) => {
    //       // Get org owners and admins
    //       const orgAdmins = await db.query.member.findMany({
    //         where: (member, {and, eq, inArray}) =>
    //           and(eq(member.organizationId, org.id), inArray(member.role, ['owner', 'admin'])),
    //       })

    //       // Collect all user IDs to add (creator + org admins/owners)
    //       const userIdsToAdd = new Set<string>()

    //       // Add the creator if exists
    //       if (user) {
    //         userIdsToAdd.add(user.id)
    //       }

    //       // Add all org owners and admins
    //       for (const admin of orgAdmins) {
    //         userIdsToAdd.add(admin.userId)
    //       }

    //       // Insert all team members
    //       if (userIdsToAdd.size > 0) {
    //         await db
    //           .insert(schema.teamMember)
    //           .values(
    //             Array.from(userIdsToAdd).map((userId) => ({
    //               id: crypto.randomUUID().replace(/-/g, ''),
    //               teamId: team.id,
    //               userId,
    //               createdAt: new Date(),
    //             }))
    //           )
    //           .onConflictDoNothing()
    //       }
    //     },
    //   },
    // }),

    lastLoginMethod(),
  ],
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema,
  }),
  trustedOrigins: env.BETTER_AUTH_URL ? [env.BETTER_AUTH_URL] : [],
  // databaseHooks: {
  //   session: {
  //     create: {
  //       before: async (userSession) => {
  //         const membership = await db.query.member.findFirst({
  //           where: eq(schema.member.userId, userSession.userId),
  //           orderBy: desc(schema.member.createdAt),
  //           columns: {organizationId: true},
  //         })

  //         return {
  //           data: {
  //             ...userSession,
  //             activeOrganizationId: membership?.organizationId,
  //           },
  //         }
  //       },
  //     },
  //   },
  // },
});
