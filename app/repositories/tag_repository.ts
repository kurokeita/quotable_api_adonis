import Tag from '#models/tag'
import { IndexAllTagsRequest } from '#requests/tags'

export default class TagRepository {
  async index(data: IndexAllTagsRequest) {
    return await Tag.query()
      .withCount('quotes')
      .orderBy('name', data.order ?? 'asc')
  }
}
