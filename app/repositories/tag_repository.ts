import Tag from '#models/tag'
import { IndexAllTagsRequest } from '#requests/tags'
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
    return await Promise.all(
      names.map((n) => Tag.create({ name: n }, { client: options.transaction }))
    )
  }
}
