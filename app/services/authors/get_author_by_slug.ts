import AuthorService from './author_service.js'

export default class GetAuthorBySlugService extends AuthorService {
  async handle(slug: string) {
    return await this.repository().getBySlug(slug)
  }
}
