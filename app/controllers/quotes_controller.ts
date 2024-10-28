import type { HttpContext } from '@adonisjs/core/http'

import {
  GetRandomQuoteRequest,
  GetRandomQuotesRequest,
  IndexAllQuotesRequest,
} from '#requests/quotes'
import GetQuoteByIdService from '#services/quotes/get_quote_by_id_service'
import GetRandomQuoteService from '#services/quotes/get_random_quote_service'
import GetRandomQuotesService from '#services/quotes/get_random_quotes_service'
import IndexAllQuoteSerive from '#services/quotes/index_all_quote_service'
import {
  getRandomQuotesValidator,
  getRandomQuoteValidator,
  indexAllQuotesValidator,
} from '#validators/quote'
import { errors, inject } from '@adonisjs/core'

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

  @inject()
  async getById({ request }: HttpContext, service: GetQuoteByIdService) {
    const result = await service.handle(request.param('id'))

    if (!result) {
      throw errors.E_HTTP_EXCEPTION.invoke(
        {
          message: 'Can not find the quote',
        },
        404
      )
    }

    return result
  }
}
