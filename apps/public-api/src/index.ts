import fastifyCors from "@fastify/cors";
import fastify from "fastify";
import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import type { ZodTypeProvider } from "fastify-type-provider-zod";

import { env } from "./env";
import { registerDatabase } from "./setup/database";
import { registerErrorHandler } from "./setup/error-handler";
import { registerOpenApi } from "./setup/openapi";
import { registerRoutes } from "./routes";

async function main() {
  // Create Fastify instance with Zod type provider
  const app = fastify({
    logger: {
      level: env.LOG_LEVEL,
      // Redact sensitive headers from logs
      redact: ["req.headers.authorization"],
      transport:
        env.NODE_ENV === "development"
          ? {
              target: "pino-pretty",
              options: {
                colorize: true,
              },
            }
          : undefined,
    },
  }).withTypeProvider<ZodTypeProvider>();

  // Set up Zod for request/response validation
  app.setSerializerCompiler(serializerCompiler);
  app.setValidatorCompiler(validatorCompiler);

  // Register plugins in order
  await app.register(fastifyCors, {
    origin: true, // Allow all origins for public API
    credentials: true,
  });

  await app.register(registerErrorHandler);
  await app.register(registerOpenApi);
  await app.register(registerDatabase);
  await app.register(registerRoutes);

  // Graceful shutdown handlers
  const shutdown = async (signal: string) => {
    app.log.info(`Received ${signal}, shutting down gracefully...`);
    try {
      await app.close();
      app.log.info("Server closed");
      process.exit(0);
    } catch (err) {
      app.log.error(err, "Error during shutdown");
      process.exit(1);
    }
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));

  // Start the server
  try {
    const address = await app.listen({
      port: env.API_PORT,
      host: env.HOSTNAME,
    });

    app.log.info(`Server listening at ${address}`);
    app.log.info(`API Documentation available at ${address}/docs`);
    app.log.info(`OpenAPI spec available at ${address}/docs/json`);
  } catch (err) {
    app.log.error(err, "Failed to start server");
    process.exit(1);
  }
}

main();
