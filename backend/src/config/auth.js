import { betterAuth } from "better-auth";
import { APIError } from "better-auth/api";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { jwt } from "better-auth/plugins";
import { MongoClient } from "mongodb";

const mongoClient = new MongoClient(
  process.env.MONGODB_URL
);

const database = mongoClient.db();

export const auth = betterAuth({
  /* ========================================================
     BETTER AUTH SERVER URL
  ======================================================== */

  baseURL: process.env.BETTER_AUTH_URL,

  /* ========================================================
     DATABASE
  ======================================================== */

  database: mongodbAdapter(database, {
    client: mongoClient,
  }),

  /* ========================================================
     USER
  ======================================================== */

  user: {
    additionalFields: {
      /*
       * ROLE
       *
       * IMPORTANT:
       * Keep input:false.
       *
       * Users cannot directly inject "admin".
       * Tenant/Owner selection is validated server-side
       * through databaseHooks below.
       */

      role: {
        type: ["tenant", "owner", "admin"],
        required: false,
        defaultValue: "tenant",
        input: false,
        returned: true,
      },

      /*
       * PROFILE PHOTO
       */

      photo: {
        type: "string",
        required: false,
        defaultValue: "",
        input: true,
        returned: true,
      },
    },
  },

  /* ========================================================
     DATABASE HOOKS
  ======================================================== */

  databaseHooks: {
    user: {
      create: {
        before: async (user, ctx) => {
          /*
           * Default role
           *
           * Social users such as Google/Facebook
           * will automatically become tenants.
           */

          let assignedRole =
            user.role || "tenant";

          /*
           * EMAIL REGISTRATION
           *
           * RegisterForm sends:
           *
           * role: "tenant"
           * OR
           * role: "owner"
           *
           * We validate it here on the server.
           */

          if (ctx?.path === "/sign-up/email") {
            const requestedRole =
              ctx?.body?.role;

            /*
             * Never allow admin from public registration.
             */

            if (
              !["tenant", "owner"].includes(
                requestedRole
              )
            ) {
              throw new APIError(
                "BAD_REQUEST",
                {
                  message:
                    "Invalid account type. Please select Tenant or Owner.",
                }
              );
            }

            assignedRole = requestedRole;
          }

          /*
           * Return the final server-controlled
           * user data.
           */

          return {
            data: {
              ...user,
              role: assignedRole,
            },
          };
        },
      },
    },
  },

  /* ========================================================
     EMAIL + PASSWORD
  ======================================================== */

  emailAndPassword: {
    enabled: true,
  },

  /* ========================================================
     SOCIAL PROVIDERS
  ======================================================== */

  socialProviders: {
    google: {
      clientId:
        process.env.GOOGLE_CLIENT_ID,

      clientSecret:
        process.env.GOOGLE_CLIENT_SECRET,
    },

    facebook: {
      clientId:
        process.env.FACEBOOK_CLIENT_ID,

      clientSecret:
        process.env.FACEBOOK_CLIENT_SECRET,
    },
  },

  /* ========================================================
     JWT
  ======================================================== */

  plugins: [
    jwt({
      jwt: {
        /*
         * JWT PAYLOAD
         *
         * These values will be available inside
         * req.user after backend JWT verification.
         */

        definePayload: ({ user }) => ({
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.name,
          photo:
            user.photo ||
            user.image ||
            "",
        }),

        /*
         * JWT expires after 7 days.
         */

        expirationTime: "7d",
      },
    }),
  ],

  /* ========================================================
     TRUSTED ORIGINS
  ======================================================== */

  trustedOrigins: [
    "http://localhost:3000",
  ],
});