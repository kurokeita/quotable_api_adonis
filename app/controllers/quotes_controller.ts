import type { HttpContext } from '@adonisjs/core/http'

import {
  GetRandomQuoteRequest,
  GetRandomQuotesRequest,
  IndexAllQuotesRequest,
} from '#requests/quotes'
import GetRandomQuoteService from '#services/quotes/get_random_quote_service'
import GetRandomQuotesService from '#services/quotes/get_random_quotes_service'
import IndexAllQuoteSerive from '#services/quotes/index_all_quote_service'
import {
  getRandomQuotesValidator,
  getRandomQuoteValidator,
  indexAllQuotesValidator,
} from '#validators/quote'
import { inject } from '@adonisjs/core'

export default class QuotesController {
  @inject()
  async index({ request }: HttpContext, service: IndexAllQuoteSerive) {
    const query = request.qs()

    const data: IndexAllQuotesRequest = await indexAllQuotesValidator.validate(query)

    return await service.handle(data)
  }

  @inject()
  async getRandom({ request }: HttpContext, service: GetRandomQuoteService) {
    const query = request.qs()

    const data: GetRandomQuoteRequest = await getRandomQuoteValidator.validate(query)

    return await service.handle(data)
  }

  @inject()
  async getRandomQuotes({ request }: HttpContext, service: GetRandomQuotesService) {
    const query = request.qs()

    const data: GetRandomQuotesRequest = await getRandomQuotesValidator.validate(query)

    return await service.handle(data)
  }
}
