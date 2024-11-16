import Author from '#models/author'
import QuoteRepository, { NewQuoteSchema } from '#repositories/quote_repository'
import { CreateQuoteRequest } from '#requests/quotes'
import GetAuthorByIdService from '#services/authors/get_author_by_id_service'
import GetAuthorBySlugService from '#services/authors/get_author_by_slug'
import SyncTagsService from '#services/tags/sync_tags_service'
import { inject } from '@adonisjs/core'
import db from '@adonisjs/lucid/services/db'
import QuoteService from './quote_service.js'

@inject()
export default class CreateQuoteService extends QuoteService {
  constructor(
    repo: QuoteRepository,
    private getAuthorByIdService: GetAuthorByIdService,
    private getAuthorBySlugService: GetAuthorBySlugService,
    private syncTagsService: SyncTagsService
  ) {
    super(repo)
  }

  async handle(input: CreateQuoteRequest) {
    await db.beginGlobalTransaction()
    let authorId: number

    if (input.authorId !== undefined && input.authorId !== null) {
      await this.getAuthorByIdService.handle(input.authorId, { withQuoteCount: false })

      authorId = input.authorId
    } else {
      const author = (await this.getAuthorBySlugService.handle(Author.getSlug(input.author ?? ''), {
        withQuoteCount: false,
      })) as Author

      authorId = author.id
    }

    try {
      const newQuoteData: NewQuoteSchema = {
        content: input.content,
        author_id: authorId,
      }

      const quote = await this.repository().create(newQuoteData)

      if (input.tags && input.tags.length > 0) {
        await this.syncTagsService.handle(quote, input.tags)
      }

      await quote.load('author')

      await db.commitGlobalTransaction()

      return quote
    } catch (error) {
      await db.rollbackGlobalTransaction()

      throw error
    }
  }
}
