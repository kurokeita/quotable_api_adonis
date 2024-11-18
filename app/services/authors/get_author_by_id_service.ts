import AuthorService from '#services/authors/author_service'
import { TransactionClientContract } from '@adonisjs/lucid/types/database'

export default class GetAuthorByIdService extends AuthorService {
  async handle(
    id: number,
    options: {
      findOrFail?: boolean
      withQuoteCount?: boolean
      transaction?: TransactionClientContract
    } = {}
  ) {
    return await this.repository().getById(id, options)
  }
}
