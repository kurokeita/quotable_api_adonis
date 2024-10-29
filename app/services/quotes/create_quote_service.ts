import QuoteRepository from '#repositories/quote_repository'
import { CreateQuoteRequest } from '#requests/quotes'
import SyncTagsService from '#services/tags/sync_tags_service'
import { inject } from '@adonisjs/core'
import db from '@adonisjs/lucid/services/db'
import QuoteService from './quote_service.js'

@inject()
export default class CreateQuoteService extends QuoteService {
  constructor(
    repo: QuoteRepository,
    private syncTagsService: SyncTagsService
  ) {
    super(repo)
  }

  async handle(input: CreateQuoteRequest) {
    await db.beginGlobalTransaction()

    const quote = await this.repository().create(input)

    if (input.tags && input.tags.length > 0) {
      await this.syncTagsService.handle(quote, input.tags)
    }

    await db.commitGlobalTransaction()

    return quote
  }
}