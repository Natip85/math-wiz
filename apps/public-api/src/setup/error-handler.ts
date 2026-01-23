import fp from "fastify-plugin";
import type { FastifyError, FastifyInstance } from "fastify";

export const registerErrorHandler = fp(async (fastify: FastifyInstance) => {
  fastify.setErrorHandler((error: FastifyError, request, reply) => {
    // Log the error
    request.log.error(
      {
        error: {
          message: error.message,
          stack: error.stack,
          code: error.code,
        },
        request: {
          method: request.method,
          url: request.url,
        },
      },
      "Request error"
    );

    // Zod validation errors
    if (error.code === "FST_ERR_VALIDATION") {
      return reply.status(400).send({
        error: "Bad Request",
        message: "Validation failed",
        details: error.message,
        statusCode: 400,
      });
    }

    // Handle known HTTP errors
    if (error.statusCode) {
      return reply.status(error.statusCode).send({
        error: error.name ?? "Error",
        message: error.message,
        statusCode: error.statusCode,
      });
    }

    // Unknown errors - don't leak details in production
    const isProduction = process.env.NODE_ENV === "production";

    return reply.status(500).send({
      error: "Internal Server Error",
      message: isProduction ? "An unexpected error occurred" : error.message,
      statusCode: 500,
    });
  });

  // Handle 404s
  fastify.setNotFoundHandler((request, reply) => {
    reply.status(404).send({
      error: "Not Found",
      message: `Route ${request.method} ${request.url} not found`,
      statusCode: 404,
    });
  });
});
