import { Knex, knex as setupKnex } from "knex";
import { env } from "./env";

const connectionDatabase = {
  sqlite: { filename: env.DATABASE_URL },
  pg: env.DATABASE_URL,
};

export const config: Knex.Config = {
  useNullAsDefault: true,
  client: env.DATABASE_CLIENT,
  connection: connectionDatabase[env.DATABASE_CLIENT],
  migrations: {
    extension: "ts",
    directory: "./db/migrations",
  },
};

export const knex = setupKnex(config);
