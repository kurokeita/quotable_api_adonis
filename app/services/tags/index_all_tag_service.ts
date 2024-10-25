import { IndexAllTagsRequest } from '#requests/tags'
import TagService from '#services/tags/tag_service'

export default class IndexAllTagsService extends TagService {
  async handle(data: IndexAllTagsRequest) {
    return await this.repository().index(data)
  }
}
