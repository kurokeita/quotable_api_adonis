import env from '#start/env'
import { HttpContext } from '@adonisjs/core/http'
import { NextFn } from '@adonisjs/core/types/http'

export default class ResourceManipulationMiddleware {
  async handle({ request, response }: HttpContext, next: NextFn) {
    console.log(env.get('RESOURCES_MANIPULATION_API_KEY'))
    if (request.header('x-api-key') !== env.get('RESOURCES_MANIPULATION_API_KEY')) {
      return response.unauthorized({ message: 'Unauthorized access' })
    }

    await next()
  }
}
