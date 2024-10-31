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

  async createMultiple(names: string[], options: { transaction?: TransactionClientContract } = {}) {
    const toInsert = names.map((n) => ({ name: n }))

    if (options.transaction) {
      await options.transaction.insertQuery().table(Tag.table).multiInsert(toInsert)
    } else {
      await db.table(Tag.table).multiInsert(toInsert)
    }

    return await this.getByNames(names, options)
  }
}
