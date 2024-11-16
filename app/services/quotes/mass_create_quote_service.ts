import AuthorRepository from '#repositories/author_repository'
import QuoteRepository, { NewQuoteSchema } from '#repositories/quote_repository'
import { CreateQuoteRequest, MassCreateQuotesRequest } from '#requests/quotes'
import SyncTagsService from '#services/tags/sync_tags_service'
import { inject } from '@adonisjs/core'
import db from '@adonisjs/lucid/services/db'
import QuoteService from './quote_service.js'
import Author from '#models/author'
import { TransactionClientContract } from '@adonisjs/lucid/types/database'

@inject()
export default class MassCreateQuotesService extends QuoteService {
  /**
   * Maximum number of quotes to process in a single database query
   * to avoid memory issues and query size limits
   */
  private CHUNK_SIZE = 500

  constructor(
    repo: QuoteRepository,
    private authorRepository: AuthorRepository,
    private syncTagsService: SyncTagsService
  ) {
    super(repo)
  }

  async handle(input: MassCreateQuotesRequest) {
    const trx = await db.transaction()

    try {
      // Filter out quotes that already exist in the database
      input.quotes = await this.filterExistingQuotes(input.quotes, trx)

      if (input.quotes.length === 0) {
        await trx.commit()
        return []
      }

      // Create quotes and associate with authors (new or existing)
      const quotes = await this.createQuotes(input, trx)

      // Prepare tag associations efficiently using Maps for O(1) lookups
      const contentToQuote = new Map(quotes.map((q) => [q.content, q]))
      const quoteTags = new Map<number, string[]>()

      // Collect all tags for each quote, ensuring uniqueness
      input.quotes.forEach((inputQuote) => {
        const quote = contentToQuote.get(inputQuote.content)
        if (quote && inputQuote.tags?.length) {
          quoteTags.set(quote.id, [...new Set(inputQuote.tags)])
        }
      })

      // Sync tags in bulk to avoid N+1 queries
      await this.syncTagsService.handleBulk(quoteTags, { transaction: trx })

      // Load created quotes with their relationships
      const result = await this.repository().getByIds(
        quotes.map((q) => q.id),
        { transaction: trx }
      )

      await trx.commit()

      return result
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }

  /**
   * Filters out quotes that already exist in the database
   * Processes in chunks to avoid memory issues with large datasets
   */
  private async filterExistingQuotes(data: CreateQuoteRequest[], trx: TransactionClientContract) {
    if (data.length === 0) return []

    // Process in chunks to avoid memory issues
    const results: CreateQuoteRequest[] = []
    const chunks = Array.from({ length: Math.ceil(data.length / this.CHUNK_SIZE) }, (_, i) =>
      data.slice(i * this.CHUNK_SIZE, (i + 1) * this.CHUNK_SIZE)
    ).filter((chunk) => chunk.length > 0)

    // Get existing quotes for each chunk
    for (const chunk of chunks) {
      const contents = chunk.map((r) => r.content)

      // Skip empty chunks to avoid empty queries
      if (contents.length === 0) continue

      const existingQuotes = await this.repository().getByContents(contents, {
        withRelations: false,
        transaction: trx,
      })

      // Use Set for O(1) lookup of existing contents
      const existingContents = new Set(existingQuotes.map((q) => q.content))

      // Filter non-existing quotes
      const newQuotes = chunk.filter((quote) => !existingContents.has(quote.content))
      results.push(...newQuotes)
    }

    return results
  }

  /**
   * Processes quotes that don't have author IDs
   * Validates that the authors exist in the database
   */
  private async processQuotesBySlug(data: CreateQuoteRequest[], trx?: TransactionClientContract) {
    if (data.length === 0) return []

    // Get authors by their slugs
    const authors = await this.authorRepository.getBySlugs(
      data.map((r) => Author.getSlug(r.author as string)),
      {
        withQuoteCount: false,
        transaction: trx,
      }
    )

    const authorMap = new Map(authors.map((a) => [a.slug, a.id]))

    // Map quotes to authors and ensure type safety
    return data
      .map((quote) => ({
        ...quote,
        authorId: authorMap.get(Author.getSlug(quote.author as string)),
      }))
      .filter((quote: CreateQuoteRequest) => {
        return typeof quote.authorId === 'number'
      })
  }

  /**
   * Processes quotes that already have author IDs
   * Validates that the authors exist in the database
   */
  private async processQuotesById(data: CreateQuoteRequest[], trx?: TransactionClientContract) {
    if (data.length === 0) return []

    // Get unique author IDs to minimize database queries
    const ids = [...new Set(data.map((r) => r.authorId as number))]
    const authors = await this.authorRepository.getByIds(ids, {
      withQuoteCount: false,
      transaction: trx,
    })

    // Create map for O(1) lookup of valid author IDs
    const authorMap = new Map(authors.map((a) => [a.id, a]))

    // Filter quotes with valid authors and ensure type safety
    return data.filter((quote): quote is CreateQuoteRequest & { authorId: number } => {
      const authorId = quote.authorId as number
      return authorMap.has(authorId)
    })
  }

  /**
   * Creates quotes in bulk with their associated authors
   * Handles both quotes with author IDs and author names
   */
  private async createQuotes(input: MassCreateQuotesRequest, trx: TransactionClientContract) {
    // Process quotes in chunks to avoid memory issues
    const processChunk = async (chunk: CreateQuoteRequest[]) => {
      const quotesByAuthorName = await this.processQuotesBySlug(
        chunk.filter((r) => r.authorId === undefined || r.authorId === null),
        trx
      )

      const quotesByAuthorId = await this.processQuotesById(
        chunk.filter((r) => r.authorId !== undefined && r.authorId !== null),
        trx
      )

      const dataToProcess = [...quotesByAuthorName, ...quotesByAuthorId]
      if (dataToProcess.length === 0) return []

      return await this.repository().createMultiple(
        dataToProcess.map((r) => ({ content: r.content, author_id: r.authorId }) as NewQuoteSchema),
        { transaction: trx }
      )
    }

    // Process in chunks of CHUNK_SIZE
    const chunks = Array.from(
      { length: Math.ceil(input.quotes.length / this.CHUNK_SIZE) },
      (_, i) => input.quotes.slice(i * this.CHUNK_SIZE, (i + 1) * this.CHUNK_SIZE)
    ).filter((chunk) => chunk.length > 0)

    const results = []
    for (const chunk of chunks) {
      const chunkResults = await processChunk(chunk)
      results.push(...chunkResults)
    }

    return results
  }
}
