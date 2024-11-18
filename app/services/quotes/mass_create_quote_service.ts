import AuthorRepository from '#repositories/author_repository'
import QuoteRepository, { NewQuoteSchema } from '#repositories/quote_repository'
import { CreateQuoteRequest, MassCreateQuotesRequest } from '#requests/quotes'
import SyncTagsService from '#services/tags/sync_tags_service'
import { inject } from '@adonisjs/core'
import db from '@adonisjs/lucid/services/db'
import QuoteService from './quote_service.js'
import Author from '#models/author'
import { TransactionClientContract } from '@adonisjs/lucid/types/database'
import Quote from '#models/quote'

interface QuoteWithAuthorId extends Omit<CreateQuoteRequest, 'author' | 'authorId'> {
  authorId: number
  author?: never
}

interface QuoteWithAuthorName extends Omit<CreateQuoteRequest, 'author' | 'authorId'> {
  author: string
  authorId?: never
}

type ValidQuoteInput = QuoteWithAuthorId | QuoteWithAuthorName

interface SkippedQuote {
  quote: CreateQuoteRequest
  reason: 'DUPLICATE' | 'INVALID_AUTHOR' | 'OTHER'
  details?: string
}

interface Result {
  inputCount: number
  createdCount: number
  skippedCount: number
  skipped: SkippedQuote[]
}

interface ProcessedQuotes {
  validQuotes: ValidQuoteInput[]
  skipped: SkippedQuote[]
}

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

  async handle(input: MassCreateQuotesRequest): Promise<Result | null> {
    const trx = await db.transaction()
    const inputCount = input.quotes.length

    try {
      // Filter out existing quotes first
      const { validQuotes, skipped: duplicateQuotes } = await this.filterExistingQuotes(
        input.quotes,
        trx
      )

      if (validQuotes.length === 0) {
        await trx.commit()
        return {
          inputCount: inputCount,
          createdCount: 0,
          skippedCount: duplicateQuotes.length,
          skipped: duplicateQuotes,
        }
      }

      // Create quotes and associate with authors (new or existing)
      const { quotes, skipped } = await this.createQuotes(input, trx)

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

      return {
        inputCount: inputCount,
        createdCount: result.length,
        skippedCount: duplicateQuotes.length + skipped.length,
        skipped: [...duplicateQuotes, ...skipped],
      }
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }

  /**
   * Filters out quotes that already exist in the database
   * Processes in chunks to avoid memory issues with large datasets
   */
  private async filterExistingQuotes(
    data: CreateQuoteRequest[],
    trx: TransactionClientContract
  ): Promise<{ validQuotes: CreateQuoteRequest[]; skipped: SkippedQuote[] }> {
    if (data.length === 0) return { validQuotes: [], skipped: [] }

    // Process in chunks to avoid memory issues
    const validQuotes: CreateQuoteRequest[] = []
    const skipped: SkippedQuote[] = []
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

      // Separate new and duplicate quotes
      for (const quote of chunk) {
        if (existingContents.has(quote.content)) {
          skipped.push({
            quote,
            reason: 'DUPLICATE',
            details: 'Quote with this content already exists',
          })
        } else {
          validQuotes.push(quote)
        }
      }
    }

    return { validQuotes, skipped }
  }

  /**
   * Creates quotes in bulk with their associated authors
   * Processes quotes in chunks to manage memory usage
   */
  private async createQuotes(
    input: MassCreateQuotesRequest,
    trx: TransactionClientContract
  ): Promise<{ quotes: Quote[]; skipped: SkippedQuote[] }> {
    // Process quotes in chunks to avoid memory issues
    const processChunk = async (
      chunk: CreateQuoteRequest[]
    ): Promise<{ quotes: Quote[]; skipped: SkippedQuote[] }> => {
      const { validQuotes, skipped } = await this.validateQuotes(chunk, trx)

      if (validQuotes.length === 0) {
        return { quotes: [], skipped }
      }

      const createdQuotes = await this.repository().createMultiple(
        validQuotes.map(
          (r) =>
            ({
              content: r.content,
              author_id: r.authorId,
            }) as NewQuoteSchema
        ),
        { transaction: trx }
      )

      return { quotes: createdQuotes, skipped }
    }

    // Process in chunks of CHUNK_SIZE
    const chunks = Array.from(
      { length: Math.ceil(input.quotes.length / this.CHUNK_SIZE) },
      (_, i) => input.quotes.slice(i * this.CHUNK_SIZE, (i + 1) * this.CHUNK_SIZE)
    ).filter((chunk) => chunk.length > 0)

    const allQuotes: Quote[] = []
    const allSkipped: SkippedQuote[] = []

    // Process each chunk and collect results
    for (const chunk of chunks) {
      const { quotes, skipped } = await processChunk(chunk)
      allQuotes.push(...quotes)
      allSkipped.push(...skipped)
    }

    return { quotes: allQuotes, skipped: allSkipped }
  }

  /**
   * Validates a batch of quotes against the database
   * Checks for valid authors and returns both valid and invalid quotes
   */
  private async validateQuotes(
    data: CreateQuoteRequest[],
    trx?: TransactionClientContract
  ): Promise<ProcessedQuotes> {
    if (data.length === 0) {
      return { validQuotes: [], skipped: [] }
    }

    // Prepare slugs and ids for lookup
    const slugsAndIds = data.map((quote) =>
      typeof quote.authorId === 'number' ? quote.authorId : Author.getSlug(quote.author as string)
    )

    // Get all authors in one query
    const authors = await this.authorRepository.getBySlugsOrIds(slugsAndIds, {
      withQuoteCount: false,
      transaction: trx,
    })

    // Create maps for O(1) lookup with a single iteration
    const { authorById, authorBySlug } = this.createAuthorMaps(authors)

    // Validate each quote and merge results
    const results = data.map((quote) => {
      if (typeof quote.authorId === 'number') {
        return this.validateQuoteByAuthorId(
          quote as CreateQuoteRequest & { authorId: number },
          authorById
        )
      }

      if (typeof quote.author === 'string') {
        return this.validateQuoteByAuthorName(
          quote as CreateQuoteRequest & { author: string },
          authorBySlug
        )
      }

      return this.handleMissingAuthor(quote)
    })

    return this.combineProcessingResults(results)
  }

  private validateQuoteByAuthorId(
    quote: CreateQuoteRequest & { authorId: number },
    authorById: Map<number, Author>
  ): ProcessedQuotes {
    const author = authorById.get(quote.authorId)

    return {
      validQuotes: author ? [this.createValidQuote(quote)] : [],
      skipped: author
        ? []
        : [this.createInvalidAuthorError(quote, `Author with ID ${quote.authorId} not found`)],
    }
  }

  private validateQuoteByAuthorName(
    quote: CreateQuoteRequest & { author: string },
    authorBySlug: Map<string, Author>
  ): ProcessedQuotes {
    const author = authorBySlug.get(Author.getSlug(quote.author))

    return {
      validQuotes: author ? [this.createValidQuote(quote, author.id)] : [],
      skipped: author
        ? []
        : [this.createInvalidAuthorError(quote, `Author not found: ${quote.author}`)],
    }
  }

  private handleMissingAuthor(quote: CreateQuoteRequest): ProcessedQuotes {
    return {
      validQuotes: [],
      skipped: [
        this.createInvalidAuthorError(quote, 'Quote must have either authorId or author name'),
      ],
    }
  }

  private createInvalidAuthorError(quote: CreateQuoteRequest, details: string): SkippedQuote {
    return {
      quote,
      reason: 'INVALID_AUTHOR',
      details,
    }
  }

  private createValidQuote(quote: CreateQuoteRequest, authorId?: number): QuoteWithAuthorId {
    return {
      ...quote,
      authorId: authorId ?? quote.authorId,
      author: undefined,
    } as QuoteWithAuthorId
  }

  private combineProcessingResults(results: ProcessedQuotes[]): ProcessedQuotes {
    return {
      validQuotes: results.flatMap((r) => r.validQuotes),
      skipped: results.flatMap((r) => r.skipped),
    }
  }

  private createAuthorMaps(authors: Author[]) {
    return authors.reduce(
      (maps, author) => {
        maps.authorById.set(author.id, author)
        maps.authorBySlug.set(author.slug, author)
        return maps
      },
      { authorById: new Map<number, Author>(), authorBySlug: new Map<string, Author>() }
    )
  }
}
