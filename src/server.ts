import fastify from 'fastify'

import { env } from './env'
import { transactionsRoutes } from './routes/transactions'

const app = fastify()
app.register(transactionsRoutes, {
  prefix: 'transactions',
})

app.listen({ port: env.PORT }, (err) => {
  if (err) throw err
  console.log(`Server listening on port ${env.PORT}`)
})
