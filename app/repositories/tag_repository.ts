import Tag from '#models/tag'
import { IndexAllTagsRequest } from '#requests/tags'

export default class TagRepository {
  async index(data: IndexAllTagsRequest) {
    return await Tag.query()
      .withScopes((scope) => scope.withQuoteCount())
      .orderBy(data.sortBy, data.order)
  }
}
