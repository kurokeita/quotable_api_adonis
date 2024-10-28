import { CreateAuthorRequest } from '#requests/authors'
import AuthorService from './author_service.js'

export default class CreateAuthorService extends AuthorService {
  async handle(input: CreateAuthorRequest) {
    return this.repository().create(input)
  }
}
