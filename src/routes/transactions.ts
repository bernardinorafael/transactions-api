import crypto from 'node:crypto'

import { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { knex } from '../database'
import { checkIdOnCookies } from '../middlewares/check-id-on-cookies'

export async function transactionsRoutes(app: FastifyInstance) {
  app.get('/', { preHandler: [checkIdOnCookies] }, async (req, reply) => {
    const cookie = req.cookies

    const transactions = await knex('transactions')
      .select('*')
      .where({ session_id: cookie.sessionId })

    return reply.status(200).send({ transactions })
  })

  app.get(
    '/summary',
    { preHandler: [checkIdOnCookies] },
    async (req, reply) => {
      const cookie = req.cookies

      const summary = await knex('transactions')
        .where({
          type: 'credit',
          session_id: cookie.sessionId,
        })
        .sum({ amount_credit: 'amount' })
        .first()

      return reply.status(200).send(summary)
    },
  )

  app.get('/:id', { preHandler: [checkIdOnCookies] }, async (req, reply) => {
    const paramsSchema = z.object({ id: z.string().uuid() })
    const params = paramsSchema.parse(req.params)
    const cookie = req.cookies

    const transaction = await knex('transactions')
      .where({
        id: params.id,
        session_id: cookie.sessionId,
      })
      .first()

    return reply.status(200).send(transaction)
  })

  app.post('/', { preHandler: [checkIdOnCookies] }, async (req, reply) => {
    const transactionBody = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(['credit', 'debit']),
    })

    const body = transactionBody.parse(req.body)
    const cookie = req.cookies

    if (!cookie.sessionId) {
      const sessionId = crypto.randomUUID()

      reply.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      })
    }

    await knex('transactions').insert({
      id: crypto.randomUUID(),
      title: body.title,
      amount: body.amount,
      type: body.type,
      session_id: cookie.sessionId,
    })

    return reply.status(201).send()
  })

  app.delete('/:id', { preHandler: [checkIdOnCookies] }, async (req, reply) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })

    const cookie = req.cookies

    const params = paramsSchema.parse(req.params)

    await knex('transactions')
      .where({
        id: params.id,
        session_id: cookie.sessionId,
      })
      .del()

    return reply.status(200).send()
  })
}
