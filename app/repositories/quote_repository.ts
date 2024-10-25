import { QuotesOrderByEnum } from '#enums/quotes'
import { SortEnum } from '#enums/sort_enum'
import Quote from '#models/quote'
import {
  GetRandomQuoteRequest,
  GetRandomQuotesRequest,
  IndexAllQuotesRequest,
} from '#requests/quotes'
import db from '@adonisjs/lucid/services/db'
import { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'
import { DateTime } from 'luxon'

const DEFAULT_LIMIT = 10
const DEFAULT_PAGE = 1

export default class QuoteRepository {
  async index(input: IndexAllQuotesRequest) {
    const query = Quote.query()

    this.filterLength(query, input.minLength, '>=')
      .filterLength(query, input.maxLength, '<=')
      .filterAuthor(query, input.author)
      .filterTags(query, input.tags)

    return await query
      .orderBy(input.sortBy ?? QuotesOrderByEnum.CREATED_AT, input.order ?? 'asc')
      .paginate(input.page ?? DEFAULT_PAGE, input.limit ?? DEFAULT_LIMIT)
  }

  async getRandomQuote(input: GetRandomQuoteRequest) {
    const query = Quote.query()

    this.filterLength(query, input.minLength, '>=')
      .filterLength(query, input.maxLength, '<=')
      .filterAuthor(query, input.author)
      .filterTags(query, input.tags)
      .queryContent(query, input.query)

    return await query.orderByRaw('RAND()').first()
  }

  async getRandomQuotes(input: GetRandomQuotesRequest) {
    const query = Quote.query()

    this.filterLength(query, input.minLength, '>=')
      .filterLength(query, input.maxLength, '<=')
      .filterAuthor(query, input.author)
      .filterTags(query, input.tags)
      .queryContent(query, input.query)

    const quotes = await query.orderByRaw('RAND()').limit(input.limit ?? DEFAULT_LIMIT)
    const sortBy = input.sortBy ?? QuotesOrderByEnum.CREATED_AT
    const order = input.order ?? SortEnum.ASC

    return quotes.sort((a, b) => {
      let comparison = 0
      const first = a[sortBy]
      const second = b[sortBy]

      if (first instanceof DateTime && second instanceof DateTime) {
        comparison = first.toUnixInteger() - second.toUnixInteger()
      } else if (typeof first === 'string' && typeof second === 'string') {
        comparison = first.localeCompare(second)
      } else if (typeof first === 'number' && typeof second === 'number') {
        comparison = first - second
      }

      return order === SortEnum.ASC ? comparison : -comparison
    })
  }

  async getById(id: number) {
    return await Quote.find(id)
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
      const tagsList: string[] = tags.split(';')

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

    query.whereRaw(`MATCH (content) AGAINST('${search}')`)
  }
}
