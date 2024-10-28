import { AuthorFactory } from '#database/factories/author_factory'
import Author from '#models/author'
import { CreateAuthorRequest, IndexAllAuthorsRequest } from '#requests/authors'
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

  // At this point, I'm trusting that the `authors` list are consisted of names that are unique and not existing in the database.
  // If somehow, there was a bug in validating the request, this method will throw a unique constraint error.
  async createMultiple(authors: Author[]) {
    // Use this instead of the `Author.createMany` to avoid multiple insert queries.
    // Documentation: https://lucid.adonisjs.com/docs/crud-operations#createmany
    await db.table(Author.table).multiInsert(authors)

    return await Author.query().whereIn(
      'slug',
      authors.map((author) => author.slug)
    )
  }

  async getByNames(names: string[] | string) {
    return await Author.query().whereIn('name', [names].flat(Infinity))
  }

  async exists(name: string, ignoreId: number | null = null) {
    const query = Author.query().where('name', name)

    if (ignoreId !== null) {
      query.whereNot('id', ignoreId)
    }

    return (await query.first()) !== null
  }
}
