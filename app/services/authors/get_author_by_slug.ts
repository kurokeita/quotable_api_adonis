import AuthorService from '#services/authors/author_service'
import { TransactionClientContract } from '@adonisjs/lucid/types/database'

export default class GetAuthorBySlugService extends AuthorService {
  async handle(
    slug: string,
    options: {
      findOrFail?: boolean
      withQuoteCount?: boolean
      transaction?: TransactionClientContract
    } = {}
  ) {
    return await this.repository().getBySlug(slug, options)
  }
}
