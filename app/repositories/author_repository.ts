import Author from '#models/author'
import { IndexAllAuthorsRequest } from '#requests/authors'

export default class AuthorRepository {
  async index(input: IndexAllAuthorsRequest) {
    const query = Author.query().withScopes((s) => s.withQuoteCount())

    if (input.slug) {
      query.where('slug', input.slug)
    }

    return await query.orderBy(input.sortBy, input.order).paginate(input.page, input.limit)
  }

  async getById(id: number) {
    return await Author.query()
      .withScopes((s) => s.withQuoteCount())
      .where('id', id)
      .first()
  }

  async getBySlug(slug: string) {
    return await Author.query()
      .withScopes((s) => s.withQuoteCount())
      .where('slug', slug)
      .first()
  }
}
