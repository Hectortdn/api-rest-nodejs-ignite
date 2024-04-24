import request from "supertest";
import { execSync } from "node:child_process";
import { it, beforeAll, afterAll, describe, expect, beforeEach } from "vitest";

import { app } from "../app";

describe("Transactions Routes", () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    execSync("npm run knex migrate:rollback --all");
    execSync("npm run knex migrate:latest");
  });

  it("should ba able to create a new transaction", async () => {
    await request(app.server)
      .post("/transactions")
      .send({
        title: "New transaction",
        amount: 5000,
        type: "credit",
      })
      .expect(201);
  });

  it("should be able to list all transactions", async () => {
    const createTransactionsResponse = await request(app.server)
      .post("/transactions")
      .send({
        title: "New transaction",
        amount: 5000,
        type: "credit",
      });

    const cookies = createTransactionsResponse.get("Set-Cookie") ?? [];

    const listTransactionsResponse = await request(app.server)
      .get("/transactions")
      .set("Cookie", cookies)
      .expect(200);

    expect(listTransactionsResponse.body).toEqual({
      transactions: [
        expect.objectContaining({
          title: "New transaction",
          amount: 5000,
        }),
      ],
    });
  });

  it("should be able to get specific transaction", async () => {
    const createTransactionsResponse = await request(app.server)
      .post("/transactions")
      .send({
        title: "New transaction",
        amount: 5000,
        type: "credit",
      });

    const cookies = createTransactionsResponse.get("Set-Cookie") ?? [];

    const listTransactionsResponse = await request(app.server)
      .get("/transactions")
      .set("Cookie", cookies);

    const transactionId = listTransactionsResponse.body.transactions[0].id;

    const getTransactionResponse = await request(app.server)
      .get(`/transactions/${transactionId}`)
      .set("Cookie", cookies)
      .expect(200);

    expect(getTransactionResponse.body.transaction).toEqual(
      expect.objectContaining({
        title: "New transaction",
        amount: 5000,
      })
    );
  });

  it("should be able to get the summary", async () => {
    const createTransactionsResponse = await request(app.server)
      .post("/transactions")
      .send({
        title: "Credit transaction",
        amount: 5000,
        type: "credit",
      });

    const cookies = createTransactionsResponse.get("Set-Cookie") ?? [];

    await request(app.server)
      .post("/transactions")
      .set("Cookie", cookies)
      .send({
        title: "Debit transaction",
        amount: 2000,
        type: "debit",
      });

    const getSummaryResponse = await request(app.server)
      .get("/transactions/summary")
      .set("Cookie", cookies)
      .expect(200);

    expect(getSummaryResponse.body.summary).toEqual({amount: 3000});
  });
});
