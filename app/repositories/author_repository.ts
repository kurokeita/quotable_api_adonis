import { AuthorFactory } from '#database/factories/author_factory'
import Author from '#models/author'
import {
  CreateAuthorRequest,
  CreateAuthorsRequest,
  IndexAllAuthorsRequest,
} from '#requests/authors'
import slugify from '#utils/slugify'
import db from '@adonisjs/lucid/services/db'

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

  async create(input: CreateAuthorRequest) {
    return await AuthorFactory.merge({
      name: input.name,
      slug: slugify(input.name),
      link: input.link,
      description: input.description,
      bio: input.bio,
    }).create()
  }

  async createMultiple(inputs: CreateAuthorsRequest) {
    const authors = inputs.authors.map(
      (input) =>
        ({
          name: input.name,
          slug: slugify(input.name),
          link: input.link,
          description: input.description,
          bio: input.bio,
        }) as Author
    )

    // Use this instead of the `Author.createMany` to avoid multiple insert queries.
    // Documentation: https://lucid.adonisjs.com/docs/crud-operations#createmany
    await db.table(Author.table).multiInsert(authors)

    return await Author.query().whereIn(
      'slug',
      authors.map((author) => author.slug)
    )
  }

  async exists(names: string[] | string) {
    return (await Author.query().whereIn('name', [names].flat(Infinity)).first()) !== null
  }
}
