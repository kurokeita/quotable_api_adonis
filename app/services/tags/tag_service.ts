import TagRepository from '#repositories/tag_repository'
import { inject } from '@adonisjs/core'

@inject()
export default class TagService {
  constructor(private repo: TagRepository) {}

  protected repository() {
    return this.repo
  }
}
