import { z } from "zod";
import crypto from "node:crypto";
import { FastifyInstance } from "fastify";

import { knex } from "../database";
import { checkSessionIdExists } from "../middlewares/check-session-id-exists";

export async function transactionsRoutes(app: FastifyInstance) {
  app.post("/", async (request, reply) => {
    const createTransactionsSchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(["credit", "debit"]),
    });

    const { title, amount, type } = createTransactionsSchema.parse(
      request.body
    );

    let sessionId = request.cookies.sessionId;

    if (!sessionId) {
      sessionId = crypto.randomUUID();

      reply.cookie("sessionId", sessionId, {
        path: "/", // access routes,
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    }

    await knex("transactions").insert({
      title,
      session_id: sessionId,
      id: crypto.randomUUID(),
      amount: type === "credit" ? amount : amount * -1,
    });

    return reply.status(201).send();
  });

  app.get("/", { preHandler: [checkSessionIdExists] }, async (request) => {
    const sessionId = request.cookies.sessionId;

    const transactions = await knex("transactions")
      .where("session_id", sessionId)
      .select();

    return {
      transactions,
    };
  });

  app.get("/:id", { preHandler: [checkSessionIdExists] }, async (request) => {
    const sessionId = request.cookies.sessionId;

    const getTransactionParamsSchema = z.object({
      id: z.string().uuid(),
    });

    const { id } = getTransactionParamsSchema.parse(request.params);

    const transaction = await knex("transactions")
      .where({
        id,
        session_id: sessionId,
      })
      .first();

    return { transaction };
  });

  app.get(
    "/summary",
    { preHandler: [checkSessionIdExists] },
    async (request) => {
      const sessionId = request.cookies.sessionId;

      const summary = await knex("transactions")
        .sum("amount", { as: "amount" })
        .where("session_id", sessionId)
        .first();

      return { summary };
    }
  );
}
