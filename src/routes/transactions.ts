import crypto from 'node:crypto'

import { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { knex } from '../database'

export async function transactionsRoutes(app: FastifyInstance) {
  app.get('/', async function (req, reply) {
    const transactions = await knex('transactions').select('*')

    return reply.status(200).send({ transactions })
  })

  app.get('/summary', async function (req, reply) {
    const summary = await knex('transactions')
      .sum({ amount_debit: 'amount' })
      .where('type', '=', 'debit')
      .first()

    return reply.status(200).send(summary)
  })

  app.get('/:id', async function (req, reply) {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })

    const params = paramsSchema.parse(req.params)

    const transaction = await knex('transactions')
      .where('id', params.id)
      .first()

    return reply.status(200).send(transaction)
  })

  app.post('/', async function (req, reply) {
    const transactionBody = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(['credit', 'debit']),
    })

    const body = transactionBody.parse(req.body)

    await knex('transactions').insert({
      id: crypto.randomUUID(),
      title: body.title,
      amount: body.amount,
      type: body.type,
    })

    return reply.status(201).send()
  })

  app.delete('/:id', async function (req, reply) {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })

    const params = paramsSchema.parse(req.params)

    await knex('transactions').where('id', params.id).del()

    return reply.status(200).send()
  })
}
