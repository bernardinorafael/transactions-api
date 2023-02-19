import cookie from '@fastify/cookie'
import fastify from 'fastify'

import { env } from './env'
import { transactionsRoutes } from './routes/transactions'

const app = fastify({
  logger: true,
})

app.register(cookie)

// app.addHook('preHandler', async (req, reply) => {})

app.register(transactionsRoutes, {
  prefix: 'transactions',
})

app.get('/', async (req, reply) => {
  return reply.status(200).send({ message: 'Welcome to my API, Bitch!!' })
})

app.listen({ port: env.PORT }, (err) => {
  if (err) throw err
  console.log(`Server listening on port ${env.PORT}`)
})
