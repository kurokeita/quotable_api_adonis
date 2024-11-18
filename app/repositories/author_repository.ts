import Author from '#models/author'
import { CreateAuthorRequest, IndexAllAuthorsRequest, UpdateAuthorRequest } from '#requests/authors'
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

  async getByIds(
    ids: number[],
    options: {
      withQuoteCount?: boolean
      transaction?: TransactionClientContract
    } = {}
  ) {
    const { withQuoteCount = true, transaction = undefined } = options
    const query = Author.query({ client: transaction }).whereIn('id', ids)

    if (withQuoteCount) {
      query.withScopes((s) => s.withQuoteCount())
    }

    return await query.exec()
  }

  async getBySlug(
    slug: string,
    options: {
      findOrFail?: boolean
      withQuoteCount?: boolean
      transaction?: TransactionClientContract
    } = {}
  ) {
    const { findOrFail = true, withQuoteCount = true, transaction = undefined } = options
    const query = Author.query({ client: transaction }).where('slug', slug)

    if (withQuoteCount) {
      query.withScopes((s) => s.withQuoteCount())
    }

    return findOrFail ? await query.firstOrFail() : await query.first()
  }

  async getBySlugs(
    slugs: string[],
    options: {
      withQuoteCount?: boolean
      transaction?: TransactionClientContract
    } = {}
  ) {
    const { withQuoteCount = true, transaction = undefined } = options
    const query = Author.query({ client: transaction }).whereIn('slug', slugs)

    if (withQuoteCount) {
      query.withScopes((s) => s.withQuoteCount())
    }

    return await query.exec()
  }

  async create(
    input: CreateAuthorRequest,
    options: { transaction?: TransactionClientContract } = {}
  ) {
    return await Author.create(
      {
        name: input.name,
        slug: Author.getSlug(input.name),
        link: input.link,
        description: input.description,
        bio: input.bio,
      },
      { client: options.transaction }
    )
  }

  async getBySlugsOrIds(
    slugsOrIds: (string | number)[],
    options: { withQuoteCount?: boolean; transaction?: TransactionClientContract } = {}
  ) {
    const { withQuoteCount = true, transaction = undefined } = options
    const query = Author.query({ client: transaction })
      .whereIn(
        'id',
        slugsOrIds.filter((id) => typeof id === 'number')
      )
      .orWhereIn(
        'slug',
        slugsOrIds.filter((slug) => typeof slug === 'string')
      )

    if (withQuoteCount) {
      query.withScopes((s) => s.withQuoteCount())
    }

    return await query.exec()
  }

  // At this point, I'm trusting that the `authors` list are consisted of names that are unique and not existing in the database.
  // If somehow, there was a bug in validating the request, this method will throw a unique constraint error.
  async createMultiple(
    authors: Author[],
    options: { transaction?: TransactionClientContract } = {}
  ) {
    const client = options.transaction || db

    // Use this instead of the `Author.createMany` to avoid multiple insert queries.
    // Documentation: https://lucid.adonisjs.com/docs/crud-operations#createmany
    await client
      .table(Author.table)
      .multiInsert(authors.map((a) => ({ ...a, slug: Author.getSlug(a.name) })))

    return await Author.query({ client: options.transaction }).whereIn(
      'slug',
      authors.map((author) => author.slug)
    )
  }

  async getByNames(
    names: string[] | string,
    options: { withQuoteCount?: boolean; transaction?: TransactionClientContract } = {}
  ) {
    const query = Author.query({ client: options.transaction }).whereIn(
      db.raw('LOWER(name)'),
      [names].flat(Infinity).map((name) => (name as String).toLowerCase())
    )

    if (options.withQuoteCount) {
      query.withScopes((s) => s.withQuoteCount())
    }

    return await query.exec()
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
        slug: input.name ? Author.getSlug(input.name) : author.slug,
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
