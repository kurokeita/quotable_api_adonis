import AuthorService from '#services/authors/author_service'

export default class GetAuthorBySlugService extends AuthorService {
  async handle(slug: string) {
    return await this.repository().getBySlug(slug)
  }
}
