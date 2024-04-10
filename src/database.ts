import { Knex, knex as setupKnex } from "knex";
import 'dotenv/config'


if (!process.env.DATABASE_URL) {
  throw new Error("Erro in Database url");
}

export const config: Knex.Config = {
  client: "sqlite",
  connection: {
    filename: process.env.DATABASE_URL,
  },
  useNullAsDefault: true,

  migrations: {
    extension: "ts",
    directory: "./db/migrations",
  },
};

export const knex = setupKnex(config);
