import { FastifyReply, FastifyRequest } from 'fastify'

export async function checkIdOnCookies(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const cookie = req.cookies

  if (!cookie.sessionId) {
    return reply.status(401).send({
      error: 'Unauthorized',
    })
  }
}
