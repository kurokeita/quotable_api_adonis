import Quote from '#models/quote'
import { IndexAllQuotesRequest } from '#requests/quotes'
import db from '@adonisjs/lucid/services/db'

export default class QuoteRepository {
  async index(input: IndexAllQuotesRequest) {
    const query = Quote.query()

    if (input.author !== undefined && input.author !== null) {
      const author: string = input.author
      query.whereHas('author', (builder) => builder.where('name', author).orWhere('slug', author))
    }

    if (input.minLength !== undefined && input.minLength !== null) {
      const minLength: number = input.minLength
      query.where(db.raw(`LENGTH(content) >= ${minLength}`))
    }

    if (input.maxLength !== undefined && input.maxLength !== null) {
      const maxLength: number = input.maxLength
      query.where(db.raw(`LENGTH(content) <= ${maxLength}`))
    }

    if (input.tags !== undefined && input.tags !== null) {
      const tags: string = input.tags

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
    }

    return await query
      .orderBy(input.sortBy ?? 'created_at', input.order ?? 'asc')
      .paginate(input.page ?? 1, input.limit ?? 10)
  }
}
