import TagRepository from '#repositories/tag_repository'
import { CreateQuoteRequest } from '#requests/quotes'
import app from '@adonisjs/core/services/app'
import db from '@adonisjs/lucid/services/db'
import QuoteService from './quote_service.js'

export default class CreateQuoteService extends QuoteService {
  async handle(input: CreateQuoteRequest) {
    await db.beginGlobalTransaction()

    const quote = await this.repository().create(input)

    if (input.tags && input.tags.length > 0) {
      const tagRepository = await app.container.make(TagRepository)

      const existedTags = await tagRepository.getByNames(input.tags)

      const newTags = await tagRepository.createMultiple(
        input.tags.filter((tag) => !existedTags.find((existedTag) => existedTag.name === tag))
      )

      await quote
        .related('tags')
        .attach([...existedTags.map((t) => t.id), ...newTags.map((t) => t.id)])
    }

    await db.commitGlobalTransaction()

    await quote.load('tags')
    await quote.load('author')

    return quote
  }
}
