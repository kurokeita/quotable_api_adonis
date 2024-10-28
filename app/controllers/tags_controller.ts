import type { HttpContext } from '@adonisjs/core/http'

import { IndexAllTagsRequest } from '#requests/tags'
import IndexAllTagsService from '#services/tags/index_all_tag_service'
import { indexAllTagsValidator } from '#validators/tag'
import { inject } from '@adonisjs/core'

export default class TagsController {
  @inject()
  async index({ request }: HttpContext, service: IndexAllTagsService) {
    const query = request.qs()

    const data: IndexAllTagsRequest = await indexAllTagsValidator.validate(query)

    const result = await service.handle(data)

    return result
  }
}
