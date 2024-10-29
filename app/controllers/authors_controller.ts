import {
  CreateAuthorRequest,
  CreateAuthorsRequest,
  IndexAllAuthorsRequest,
  UpdateAuthorRequest,
} from '#requests/authors'
import CreateAuthorService from '#services/authors/create_author_service'
import CreateAuthorsService from '#services/authors/create_authors_service'
import DeleteAuthorService from '#services/authors/delete_author_service'
import GetAuthorByIdService from '#services/authors/get_author_by_id_service'
import GetAuthorBySlugService from '#services/authors/get_author_by_slug'
import IndexAllAuthorsService from '#services/authors/index_all_author_service'
import UpdateAuthorService from '#services/authors/update_author_service'
import {
  createAuthorsValidator,
  createAuthorValidator,
  indexAllAuthorsValidator,
  updateAuthorValidator,
} from '#validators/author'
import { errors, inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'

export default class AuthorsController {
  @inject()
  async index({ request }: HttpContext, service: IndexAllAuthorsService) {
    const data: IndexAllAuthorsRequest = await request.validateUsing(indexAllAuthorsValidator)

    return await service.handle(data)
  }

  @inject()
  async getById({ request }: HttpContext, service: GetAuthorByIdService) {
    return await service.handle(request.param('id'))
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
    const data: CreateAuthorRequest = await request.validateUsing(createAuthorValidator)

    return await service.handle(data)
  }

  @inject()
  async createMultiple({ request }: HttpContext, service: CreateAuthorsService) {
    const data: CreateAuthorsRequest = await request.validateUsing(createAuthorsValidator)

    return await service.handle(data)
  }

  @inject()
  async update({ request }: HttpContext, service: UpdateAuthorService) {
    const id = request.param('id')

    const data: UpdateAuthorRequest = await request.validateUsing(updateAuthorValidator, {
      meta: { authorId: id },
    })

    return await service.handle(id, data)
  }

  @inject()
  async delete({ request }: HttpContext, service: DeleteAuthorService) {
    return await service.handle(request.param('id'))
  }
}
