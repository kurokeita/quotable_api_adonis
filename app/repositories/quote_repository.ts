import { OrderEnum } from '#enums/order_enum'
import Quote from '#models/quote'
import {
  CreateQuoteRequest,
  GetRandomQuoteRequest,
  GetRandomQuotesRequest,
  IndexAllQuotesRequest,
} from '#requests/quotes'
import db from '@adonisjs/lucid/services/db'
import { TransactionClientContract } from '@adonisjs/lucid/types/database'
import { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'
import { DateTime } from 'luxon'

export default class QuoteRepository {
  async index(
    input: IndexAllQuotesRequest,
    options: { transaction?: TransactionClientContract } = {}
  ) {
    const query = Quote.query({ client: options.transaction })

    this.filterLength(query, input.minLength, '>=')
      .filterLength(query, input.maxLength, '<=')
      .filterAuthor(query, input.author)
      .filterTags(query, input.tags)

    return await query.orderBy(input.sortBy, input.order).paginate(input.page, input.limit)
  }

  async getRandomQuote(
    input: GetRandomQuoteRequest,
    options: { transaction?: TransactionClientContract } = {}
  ) {
    const query = Quote.query({ client: options.transaction })

    this.filterLength(query, input.minLength, '>=')
      .filterLength(query, input.maxLength, '<=')
      .filterAuthor(query, input.author)
      .filterTags(query, input.tags)
      .queryContent(query, input.query)

    return await query.orderByRaw('RAND()').first()
  }

  async getRandomQuotes(
    input: GetRandomQuotesRequest,
    options: { transaction?: TransactionClientContract } = {}
  ) {
    const query = Quote.query({ client: options.transaction })

    this.filterLength(query, input.minLength, '>=')
      .filterLength(query, input.maxLength, '<=')
      .filterAuthor(query, input.author)
      .filterTags(query, input.tags)
      .queryContent(query, input.query)

    const quotes = await query.orderByRaw('RAND()').limit(input.limit)

    return quotes.sort((a, b) => {
      let comparison = 0
      const first = a[input.sortBy]
      const second = b[input.sortBy]

      if (first instanceof DateTime && second instanceof DateTime) {
        comparison = first.toUnixInteger() - second.toUnixInteger()
      } else if (typeof first === 'string' && typeof second === 'string') {
        comparison = first.localeCompare(second)
      } else if (typeof first === 'number' && typeof second === 'number') {
        comparison = first - second
      }

      return input.order === OrderEnum.ASC ? comparison : -comparison
    })
  }

  async getById(
    id: number,
    options: { findOrFail?: boolean; transactions?: TransactionClientContract } = {}
  ) {
    const { findOrFail = true, transactions = undefined } = options

    return findOrFail
      ? await Quote.findOrFail(id, { client: transactions })
      : await Quote.find(id, { client: transactions })
  }

  async create(
    input: CreateQuoteRequest,
    options: { transaction?: TransactionClientContract } = {}
  ) {
    return await Quote.create(
      { content: input.content, authorId: input.authorId },
      { client: options.transaction }
    )
  }

  private filterLength(
    query: ModelQueryBuilderContract<typeof Quote, Quote>,
    length: number | undefined | null,
    direction: '>=' | '<='
  ) {
    if (length !== undefined && length !== null) {
      query.where(db.raw(`LENGTH(content) ${direction} ${length}`))
    }

    return this
  }

  private filterAuthor(
    query: ModelQueryBuilderContract<typeof Quote, Quote>,
    author: string | undefined | null
  ) {
    if (author !== undefined && author !== null) {
      query.whereHas('author', (builder) => builder.where('name', author).orWhere('slug', author))
    }

    return this
  }

  private filterTags(
    query: ModelQueryBuilderContract<typeof Quote, Quote>,
    tags: string | undefined | null
  ) {
    if (tags === undefined || tags === null) {
      return this
    }

    if (tags.includes('|')) {
      const tagsList: string[] = tags.split('|')

      query.whereHas('tags', (builder) => {
        tagsList.forEach((tag: string) => builder.orWhere('name', tag))
      })
    } else {
      const tagsList: string[] = tags.split(',')

      tagsList.forEach((tag: string) =>
        query.whereHas('tags', (builder) => builder.where('name', tag))
      )
    }

    return this
  }

  private queryContent(
    query: ModelQueryBuilderContract<typeof Quote, Quote>,
    search: string | undefined | null
  ) {
    if (search === undefined || search === null) {
      return this
    }

    const keywords = search
      .split(/[\s,;]+/)
      .map((w) => w + '*')
      .join(',')

    query.whereRaw(`MATCH (content) AGAINST('${keywords}' IN BOOLEAN MODE)`)
  }
}
