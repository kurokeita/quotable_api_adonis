import { IndexAllAuthorsRequest } from '#requests/authors'
import AuthorService from './author_service.js'

export default class IndexAllAuthorsService extends AuthorService {
  async handle(data: IndexAllAuthorsRequest) {
    return await this.repository().index(data)
  }
}
