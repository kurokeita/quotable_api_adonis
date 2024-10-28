import {
  CreateAuthorRequest,
  CreateAuthorsRequest,
  IndexAllAuthorsRequest,
} from '#requests/authors'
import CreateAuthorService from '#services/authors/create_author_service'
import CreateAuthorsService from '#services/authors/create_authors_service'
import GetAuthorByIdService from '#services/authors/get_author_by_id_service'
import GetAuthorBySlugService from '#services/authors/get_author_by_slug'
import IndexAllAuthorsService from '#services/authors/index_all_author_service'
import {
  createAuthorsValidator,
  createAuthorValidator,
  indexAllAuthorsValidator,
} from '#validators/author'
import { errors, inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'

export default class AuthorsController {
  @inject()
  async index({ request }: HttpContext, service: IndexAllAuthorsService) {
    const query = request.qs()

    const data: IndexAllAuthorsRequest = await indexAllAuthorsValidator.validate(query)

    return await service.handle(data)
  }

  @inject()
  async getById({ request }: HttpContext, service: GetAuthorByIdService) {
    const result = await service.handle(request.param('id'))

    if (!result) {
      throw errors.E_HTTP_EXCEPTION.invoke(
        {
          message: 'Can not find the author',
        },
        404
      )
    }

    return result
  }

  @inject()
  async getBySlug({ request }: HttpContext, service: GetAuthorBySlugService) {
    const result = await service.handle(request.param('slug'))

    if (!result) {
      throw errors.E_HTTP_EXCEPTION.invoke(
        {
          message: 'Can not find the author',
        },
        404
      )
    }

    return result
  }

  @inject()
  async create({ request }: HttpContext, service: CreateAuthorService) {
    const data: CreateAuthorRequest = await createAuthorValidator.validate(request.body())

    return await service.handle(data)
  }

  @inject()
  async createMultiple({ request }: HttpContext, service: CreateAuthorsService) {
    const data: CreateAuthorsRequest = await createAuthorsValidator.validate(request.body())

    return await service.handle(data)
  }
}
