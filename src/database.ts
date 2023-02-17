import { Knex, knex as setupKnex } from 'knex'

import { env } from './env'

export const knexConfig: Knex.Config = {
  client: 'sqlite',
  connection: {
    filename: env.DATABASE_URL,
  },
  migrations: {
    extension: 'ts',
    directory: './db/migrations',
  },

  useNullAsDefault: true,
}

export const knex = setupKnex(knexConfig)
