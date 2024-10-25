import env from '#start/env'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class ServerMonitorMiddleware {
  async handle({ request, response }: HttpContext, next: NextFn) {
    if (request.header('x-monitoring-secret') !== env.get('HEALTH_CHECK_SECRET')) {
      return response.unauthorized({ message: 'Unauthorized access' })
    }

    await next()
  }
}
