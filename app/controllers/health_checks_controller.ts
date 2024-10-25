import { healthChecks } from '#start/health'
import type { HttpContext } from '@adonisjs/core/http'

export default class HealthChecksController {
  async handle({ response }: HttpContext) {
    const report = await healthChecks.run()

    if (report.isHealthy) {
      return response.ok(report)
    }

    return response.serviceUnavailable(report)
  }

  ping({ request, response }: HttpContext) {
    return response.send({
      ip: request.ip(),
      host: request.hostname(),
      headers: request.headers(),
    })
  }
}
