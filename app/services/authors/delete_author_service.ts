import AuthorService from './author_service.js'

export default class DeleteAuthorService extends AuthorService {
  async handle(id: number) {
    return await this.repository().delete(id)
  }
}
