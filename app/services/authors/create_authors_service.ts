import { CreateAuthorsRequest } from '#requests/authors'
import AuthorService from '#services/authors/author_service' // Adjust the import path as necessary

export default class CreateAuthorsService extends AuthorService {
  async handle(inputs: CreateAuthorsRequest) {
    return await this.repository().createMultiple(inputs)
  }
}
