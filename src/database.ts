import 'dotenv/config'

import { Knex, knex as setupKnex } from 'knex'

export const knexConfig: Knex.Config = {
  client: 'sqlite',
  connection: {
    filename: process.env.DATABASE_URL!,
  },
  migrations: {
    extension: 'ts',
    directory: './db/migrations',
  },

  useNullAsDefault: true,
}

export const knex = setupKnex(knexConfig)
