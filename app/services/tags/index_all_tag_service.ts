import { IndexAllTagsRequest } from '#requests/tags'
import TagService from '#services/tags/tag_service'

export default class IndexAllTagsService extends TagService {
  async handle(data: IndexAllTagsRequest) {
    const tags = await this.repository().index(data)

    return {
      meta: {
        total: tags.length,
      },
      data: tags,
    }
  }
}
