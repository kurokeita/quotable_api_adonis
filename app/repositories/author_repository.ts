import Author from '#models/author'
import { CreateAuthorRequest, IndexAllAuthorsRequest, UpdateAuthorRequest } from '#requests/authors'
import slugify from '#utils/slugify'
import db from '@adonisjs/lucid/services/db'
import { TransactionClientContract } from '@adonisjs/lucid/types/database'

export default class AuthorRepository {
  async index(input: IndexAllAuthorsRequest) {
    const query = Author.query().withScopes((s) => s.withQuoteCount())

    if (input.slug) {
      query.where('slug', input.slug)
    }

    return await query.orderBy(input.sortBy, input.order).paginate(input.page, input.limit)
  }

  async getById(
    id: number,
    options: {
      findOrFail?: boolean
      withQuoteCount?: boolean
      transaction?: TransactionClientContract
    } = {}
  ) {
    const { findOrFail = true, withQuoteCount = true, transaction = undefined } = options
    const query = Author.query({ client: transaction }).where('id', id)

    if (withQuoteCount) {
      query.withScopes((s) => s.withQuoteCount())
    }

    return findOrFail ? await query.firstOrFail() : await query.first()
  }

  async getBySlug(slug: string) {
    return await Author.query()
      .withScopes((s) => s.withQuoteCount())
      .where('slug', slug)
      .first()
  }

  async create(
    input: CreateAuthorRequest,
    options: { transaction?: TransactionClientContract } = {}
  ) {
    return await Author.create(
      {
        name: input.name,
        slug: slugify(input.name),
        link: input.link,
        description: input.description,
        bio: input.bio,
      },
      { client: options.transaction }
    )
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

  async update(
    id: number,
    input: Partial<UpdateAuthorRequest>,
    options: { transaction?: TransactionClientContract } = {}
  ) {
    const author = await this.getById(id, {
      withQuoteCount: false,
      transaction: options.transaction,
    })

    await author
      ?.merge({
        name: input.name ?? author.name,
        slug: input.name ? slugify(input.name) : author.slug,
        link: input.link ?? author.link,
        description: input.description ?? author.description,
        bio: input.bio ?? author.bio,
      })
      .save()

    return author
  }

  async delete(id: number, options: { transaction?: TransactionClientContract } = {}) {
    const { transaction = undefined } = options

    const author = await this.getById(id, { withQuoteCount: false, transaction: transaction })

    await author?.delete()

    return author
  }

  async exists(name: string, ignoreId: number | null = null) {
    const query = Author.query().where('name', name)

    if (ignoreId !== null) {
      query.whereNot('id', ignoreId)
    }

    return (await query.first()) !== null
  }
}
