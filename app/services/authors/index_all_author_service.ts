import { IndexAllAuthorsRequest } from '#requests/authors'
import AuthorService from '#services/authors/author_service'

export default class IndexAllAuthorsService extends AuthorService {
  async handle(data: IndexAllAuthorsRequest) {
    return await this.repository().index(data)
  }
}
