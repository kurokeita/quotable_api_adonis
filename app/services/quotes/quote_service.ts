import QuoteRepository from '#repositories/quote_repository'
import { inject } from '@adonisjs/core'

@inject()
export default class QuoteService {
  constructor(private repo: QuoteRepository) {}

  protected repository() {
    return this.repo
  }
}
