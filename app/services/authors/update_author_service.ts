import { UpdateAuthorRequest } from '#requests/authors'
import AuthorService from './author_service.js'

export default class UpdateAuthorService extends AuthorService {
  async handle(id: number, input: UpdateAuthorRequest) {
    return await this.repository().update(id, input)
  }
}
