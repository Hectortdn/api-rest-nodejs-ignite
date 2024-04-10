import fastify from "fastify";
import { knex } from "./database";
import crypto from "nodse:crypto";

const app = fastify();

app.get("/hello", async () => {
  // const transaction = await knex('transactions').insert({
  //   id: crypto.randomUUID(),
  //   title: 'Transação tete',
  //   amount: 1000
  // }).returning('*');

  const transactions = await knex("transactions").select("*");
  return transactions;
});

app
  .listen({
    port: 3334,
  })
  .then(() => {
    console.log("HTTP Server Running!");
  });
