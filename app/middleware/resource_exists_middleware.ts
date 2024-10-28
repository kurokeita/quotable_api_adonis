import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { BaseModel } from '@adonisjs/lucid/orm'

export default class ResourceExistsMiddleware {
  async handle({ request }: HttpContext, next: NextFn, options: { resource: typeof BaseModel }) {
    await options.resource.findOrFail(request.param('id'))

    await next()
  }
}
