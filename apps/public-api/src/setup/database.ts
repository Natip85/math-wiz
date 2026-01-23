import fp from "fastify-plugin";

import { db } from "@math-wiz/db";

// Extend FastifyInstance to include db
declare module "fastify" {
  interface FastifyInstance {
    db: typeof db;
  }
}

export const registerDatabase = fp(async (fastify) => {
  // Use the shared db instance from @math-wiz/db
  fastify.decorate("db", db);

  fastify.log.info("Database connection established");
});
