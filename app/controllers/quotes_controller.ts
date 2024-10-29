import type { HttpContext } from '@adonisjs/core/http'

import {
  CreateQuoteRequest,
  GetRandomQuoteRequest,
  GetRandomQuotesRequest,
  IndexAllQuotesRequest,
  UpdateQuoteRequest,
} from '#requests/quotes'
import CreateQuoteService from '#services/quotes/create_quote_service'
import GetQuoteByIdService from '#services/quotes/get_quote_by_id_service'
import GetRandomQuoteService from '#services/quotes/get_random_quote_service'
import GetRandomQuotesService from '#services/quotes/get_random_quotes_service'
import IndexAllQuoteSerive from '#services/quotes/index_all_quote_service'
import UpdateQuoteService from '#services/quotes/update_quote_service'
import {
  createQuoteValidator,
  getRandomQuotesValidator,
  getRandomQuoteValidator,
  indexAllQuotesValidator,
  updateQuoteValidator,
} from '#validators/quote'
import { inject } from '@adonisjs/core'

export default class QuotesController {
  @inject()
  async index({ request }: HttpContext, service: IndexAllQuoteSerive) {
    const data: IndexAllQuotesRequest = await request.validateUsing(indexAllQuotesValidator)

    return await service.handle(data)
  }

  @inject()
  async getRandom({ request }: HttpContext, service: GetRandomQuoteService) {
    const data: GetRandomQuoteRequest = await request.validateUsing(getRandomQuoteValidator)

    return await service.handle(data)
  }

  @inject()
  async getRandomQuotes({ request }: HttpContext, service: GetRandomQuotesService) {
    const data: GetRandomQuotesRequest = await request.validateUsing(getRandomQuotesValidator)

    return await service.handle(data)
  }

  @inject()
  async getById({ request }: HttpContext, service: GetQuoteByIdService) {
    return await service.handle(request.param('id'))
  }

  @inject()
  async create({ request }: HttpContext, service: CreateQuoteService) {
    const data: CreateQuoteRequest = await request.validateUsing(createQuoteValidator)

    return await service.handle(data)
  }

  @inject()
  async update({ request }: HttpContext, service: UpdateQuoteService) {
    const data: UpdateQuoteRequest = await request.validateUsing(updateQuoteValidator)

    return await service.handle(request.param('id'), data)
  }
}
