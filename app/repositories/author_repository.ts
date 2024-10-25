import Author from '#models/author'
import { IndexAllAuthorsRequest } from '#requests/authors'

export default class AuthorRepository {
  async index(input: IndexAllAuthorsRequest) {
    const query = Author.query()

    if (input.slug) {
      query.where('slug', input.slug)
    }

    return await query
      .orderBy(input.sortBy ?? 'name', input.order ?? 'asc')
      .paginate(input.page ?? 1, input.limit ?? 10)
  }

  async getById(id: number) {
    return await Author.find(id)
  }

  async getBySlug(slug: string) {
    return await Author.query().where('slug', slug).first()
  }
}
