import AuthorService from '#services/authors/author_service'

export default class GetAuthorByIdService extends AuthorService {
  async handle(id: number) {
    return await this.repository().getById(id)
  }
}
