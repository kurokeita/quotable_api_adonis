import AuthorRepository from '#repositories/author_repository'
import QuoteRepository, { NewQuoteSchema } from '#repositories/quote_repository'
import TagRepository from '#repositories/tag_repository'
import { CreateQuoteRequest, MassCreateQuotesRequest } from '#requests/quotes'
import SyncTagsService from '#services/tags/sync_tags_service'
import slugify from '#utils/slugify'
import { inject } from '@adonisjs/core'
import db from '@adonisjs/lucid/services/db'
import QuoteService from './quote_service.js'

@inject()
export default class MassCreateQuotesService extends QuoteService {
  constructor(
    repo: QuoteRepository,
    private authorRepository: AuthorRepository,
    private tagRepository: TagRepository,
    private syncTagsService: SyncTagsService
  ) {
    super(repo)
  }

  async handle(input: MassCreateQuotesRequest) {
    await db.beginGlobalTransaction()

    try {
      const quotesByAuthorName = await this.processQuotesBySlug(
        input.quotes.filter((r) => r.authorId === undefined || r.authorId === null)
      )

      const quotesByAuthorId = await this.processQuotesById(
        input.quotes.filter((r) => r.authorId !== undefined && r.authorId !== null)
      )

      const dataToProcess = [...quotesByAuthorName, ...quotesByAuthorId]

      const quotes = await this.repository().createMultiple(
        dataToProcess.map((r) => ({ content: r.content, author_id: r.authorId }) as NewQuoteSchema)
      )

      await this.processTags(dataToProcess)

      for (const q of quotes) {
        const tags = [...new Set(input.quotes.find((r) => r.content === q.content)?.tags)]

        if (tags && tags.length > 0) {
          await this.syncTagsService.handle(q, tags)
        }
      }

      await db.commitGlobalTransaction()

      return quotes
    } catch (error) {
      await db.rollbackGlobalTransaction()
      throw error
    }
  }

  private async processQuotesBySlug(data: CreateQuoteRequest[]) {
    data = structuredClone(data)
    data.map((r) => (r.author = slugify(r.author as string, { lower: true })))

    const slugs = data.map((r) => r.author as string)

    if (slugs.length > 0) {
      const authors = await this.authorRepository.getBySlugs(slugs, { withQuoteCount: false })

      data.forEach((r) => (r.authorId = authors.find((a) => a.slug === r.author)?.id))
    }

    return data.filter((r) => r.authorId !== undefined && r.authorId !== null)
  }

  private async processQuotesById(data: CreateQuoteRequest[]) {
    data = structuredClone(data)
    const ids = data.map((r) => r.authorId as number)

    if (ids.length === 0) {
      return []
    }

    const authors = await this.authorRepository.getByIds(ids, { withQuoteCount: false })

    return data.filter((r) => authors.find((a) => a.id === r.authorId))
  }

  private async processTags(data: CreateQuoteRequest[]) {
    data = structuredClone(data)
    const tags = [
      ...new Set(
        data
          .map((r) => r.tags)
          .flat()
          .filter((t) => t !== undefined && t !== null)
      ),
    ]

    const existedTags = await this.tagRepository.getByNames(tags)

    const tagsToCreate = tags.filter(
      (tag) => !existedTags.find((existedTag) => existedTag.name === tag)
    )

    if (tagsToCreate.length > 0) {
      await this.tagRepository.createMultiple(tagsToCreate)
    }
  }
}
