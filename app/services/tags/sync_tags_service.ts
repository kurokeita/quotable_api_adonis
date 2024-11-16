import Quote from '#models/quote'
import Tag from '#models/tag'
import QuoteRepository from '#repositories/quote_repository'
import db from '@adonisjs/lucid/services/db'
import TagService from './tag_service.js'
import TagRepository from '#repositories/tag_repository'
import { inject } from '@adonisjs/core'
import { TransactionClientContract } from '@adonisjs/lucid/types/database'

@inject()
export default class SyncTagsService extends TagService {
  constructor(
    repo: TagRepository,
    private quoteRepository: QuoteRepository
  ) {
    super(repo)
  }

  async handle(
    quote: Quote,
    tags: string[],
    options: { transaction?: TransactionClientContract } = {}
  ) {
    const client = options.transaction || undefined

    const existedTags = await this.repository().getByNames(tags, {
      transaction: client,
    })

    if (existedTags.length !== tags.length) {
      const newTags = await this.repository().upsertMultiple(
        tags.filter((tag) => !existedTags.find((existedTag) => existedTag.name === tag)),
        { transaction: client }
      )

      existedTags.push(...newTags)
    }

    await quote.related('tags').sync(
      existedTags.map((tag) => tag.id),
      true,
      client
    )

    await quote.load('tags')

    return quote
  }

  async handleBulk(
    quoteTags: Map<number, string[]>,
    options: { transaction?: TransactionClientContract } = {}
  ) {
    if (quoteTags.size === 0) {
      return []
    }

    // Get all quotes at once
    const quotes = await this.quoteRepository.getByIds([...quoteTags.keys()], {
      withRelations: false,
      transaction: options.transaction,
    })

    // Get all unique tags
    const allTags = [...new Set([...quoteTags.values()].flat())]

    // Get or create all tags at once
    const tags = await this.repository().upsertMultiple(allTags, {
      transaction: options.transaction,
    })

    // Create a map of tag name to tag id for efficient lookup
    const tagMap = new Map(tags.map((tag) => [tag.name, tag.id]))

    // Prepare all quote-tag relationships in a single array
    const relationships = []
    for (const quote of quotes) {
      const tagNames = quoteTags.get(quote.id) || []
      const tagIds = tagNames.map((name) => tagMap.get(name)).filter((id) => id !== undefined)

      for (const tagId of tagIds) {
        relationships.push({
          quote_id: quote.id,
          tag_id: tagId,
        })
      }
    }

    // Delete existing relationships and insert new ones in bulk
    if (relationships.length > 0) {
      const pivotTable = Tag.quoteTagPivotTable
      const client = options.transaction || db

      await client
        .from(pivotTable)
        .whereIn(
          'quote_id',
          quotes.map((q) => q.id)
        )
        .delete()

      await client.table(pivotTable).multiInsert(relationships)
    }

    // Load tags for all quotes if needed
    if (quotes.length > 0) {
      await Quote.query({ client: options.transaction })
        .whereIn(
          'id',
          quotes.map((q) => q.id)
        )
        .preload('tags')
    }

    return quotes
  }
}
