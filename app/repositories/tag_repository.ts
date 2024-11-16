import Tag from '#models/tag'
import { IndexAllTagsRequest } from '#requests/tags'
import db from '@adonisjs/lucid/services/db'
import { TransactionClientContract } from '@adonisjs/lucid/types/database'

export default class TagRepository {
  async index(
    data: IndexAllTagsRequest,
    options: { transaction?: TransactionClientContract } = {}
  ) {
    return await Tag.query({ client: options.transaction })
      .withScopes((scope) => scope.withQuoteCount())
      .orderBy(data.sortBy, data.order)
  }

  async getByNames(names: string[], options: { transaction?: TransactionClientContract } = {}) {
    return await Tag.query({ client: options.transaction }).whereIn('name', names)
  }

  /**
   * Upsert multiple tags at once. If a tag with the same name already exists,
   * it will be ignored and the existing tag will be returned.
   */
  async upsertMultiple(names: string[], options: { transaction?: TransactionClientContract } = {}) {
    const uniqueNames = [...new Set(names)]
    const client = options.transaction || db
    const insert = client.table(Tag.table).knexQuery.insert(uniqueNames.map((n) => ({ name: n })))

    await client.rawQuery('? ON DUPLICATE KEY UPDATE id = id', [insert])

    // Return all tags (both newly created and existing ones)
    return await this.getByNames(uniqueNames, options)
  }
}
