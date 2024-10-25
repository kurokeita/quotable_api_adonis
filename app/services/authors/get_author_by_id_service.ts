import AuthorService from './author_service.js'

export default class GetAuthorByIdService extends AuthorService {
  async handle(id: number) {
    return await this.repository().getById(id)
  }
}
