import dotenv from "dotenv";
import path from "path";
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

// Load env from web app's .env file (where your vars are stored)
// When running from apps/public-api/, go to ../web/.env
const envPath = path.resolve(process.cwd(), "../web/.env");
console.log("Loading env from:", envPath);
dotenv.config({ path: envPath });

export const env = createEnv({
  server: {
    // Database
    DATABASE_URL: z.string().min(1),

    // Stytch M2M Authentication
    STYTCH_PROJECT_ID: z.string().min(1),
    STYTCH_SECRET: z.string().min(1),

    // Server configuration
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    API_PORT: z.coerce.number().default(8080),
    HOSTNAME: z.string().default("0.0.0.0"),
    APIS_PUBLIC_BASE_URL: z.string().url().optional(),
    VERSION: z.string().default("1.0.0"),
    LOG_LEVEL: z.enum(["trace", "debug", "info", "warn", "error"]).default("info"),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    STYTCH_PROJECT_ID: process.env.STYTCH_PROJECT_ID,
    STYTCH_SECRET: process.env.STYTCH_SECRET,
    NODE_ENV: process.env.NODE_ENV,
    API_PORT: process.env.API_PORT ?? process.env.PORT,
    HOSTNAME: process.env.HOSTNAME,
    APIS_PUBLIC_BASE_URL: process.env.APIS_PUBLIC_BASE_URL,
    VERSION: process.env.VERSION ?? "1.0.0",
    LOG_LEVEL: process.env.LOG_LEVEL,
  },
  emptyStringAsUndefined: true,
});
