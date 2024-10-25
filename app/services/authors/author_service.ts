import AuthorRepository from '#repositories/author_repository'
import { inject } from '@adonisjs/core'

@inject()
export default class AuthorService {
  constructor(private repo: AuthorRepository) {}

  protected repository() {
    return this.repo
  }
}
