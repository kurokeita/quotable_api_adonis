import Quote from '#models/quote'
import { GetRandomQuoteRequest, IndexAllQuotesRequest } from '#requests/quotes'
import db from '@adonisjs/lucid/services/db'
import { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'

export default class QuoteRepository {
  async index(input: IndexAllQuotesRequest) {
    const query = Quote.query()

    this.filterLength(query, input.minLength, '>=')
      .filterLength(query, input.maxLength, '<=')
      .filterAuthor(query, input.author)
      .filterTags(query, input.tags)

    return await query
      .orderBy(input.sortBy ?? 'created_at', input.order ?? 'asc')
      .paginate(input.page ?? 1, input.limit ?? 10)
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
