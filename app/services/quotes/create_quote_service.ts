import Author from '#models/author'
import QuoteRepository from '#repositories/quote_repository'
import { CreateQuoteRequest } from '#requests/quotes'
import GetAuthorBySlugService from '#services/authors/get_author_by_slug'
import SyncTagsService from '#services/tags/sync_tags_service'
import slugify from '#utils/slugify'
import { inject } from '@adonisjs/core'
import db from '@adonisjs/lucid/services/db'
import QuoteService from './quote_service.js'

@inject()
export default class CreateQuoteService extends QuoteService {
  constructor(
    repo: QuoteRepository,
    private syncTagsService: SyncTagsService,
    private getAuthorBySlugService: GetAuthorBySlugService
  ) {
    super(repo)
  }

  async handle(input: CreateQuoteRequest) {
    await db.beginGlobalTransaction()

    if (!input.authorId) {
      const author = (await this.getAuthorBySlugService.handle(
        slugify(input.author ?? '')
      )) as Author

      input.authorId = author.id
    }

    try {
      const quote = await this.repository().create(input)

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
