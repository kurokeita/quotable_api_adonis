import type { HttpContext } from '@adonisjs/core/http'

import {
  CreateQuoteRequest,
  GetRandomQuoteRequest,
  GetRandomQuotesRequest,
  IndexAllQuotesRequest,
  MassCreateQuotesRequest,
  UpdateQuoteRequest,
} from '#requests/quotes'
import CreateQuoteService from '#services/quotes/create_quote_service'
import DeleteQuoteService from '#services/quotes/delete_quote_service'
import GetQuoteByIdService from '#services/quotes/get_quote_by_id_service'
import GetRandomQuoteService from '#services/quotes/get_random_quote_service'
import GetRandomQuotesService from '#services/quotes/get_random_quotes_service'
import IndexAllQuoteSerive from '#services/quotes/index_all_quote_service'
import MassCreateQuotesService from '#services/quotes/mass_create_quote_service'
import UpdateQuoteService from '#services/quotes/update_quote_service'
import {
  createQuoteValidator,
  getRandomQuotesValidator,
  getRandomQuoteValidator,
  indexAllQuotesValidator,
  massCreateQuotesValidator,
  quotesJsonValidator,
  updateQuoteValidator,
} from '#validators/quote'
import { inject } from '@adonisjs/core'
import * as fs from 'node:fs' // <--- Added import statement

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
  async massCreate({ request }: HttpContext, service: MassCreateQuotesService) {
    const data: MassCreateQuotesRequest = await request.validateUsing(massCreateQuotesValidator)

    return await service.handle(data)
  }

  @inject()
  async massCreateFromFile({ request }: HttpContext, service: MassCreateQuotesService) {
    const { quotes: file } = await request.validateUsing(quotesJsonValidator)

    try {
      // Read file content using tmpPath for temporary files
      const content = await fs.promises.readFile(file.tmpPath!)
      const jsonContent = JSON.parse(content.toString())

      // Validate the parsed content using mass create validator
      const validatedData = await massCreateQuotesValidator.validate({ quotes: jsonContent })

      // Process the quotes using the service
      return await service.handle(validatedData)
    } catch (error) {
      return {
        error: true,
        message: 'Failed to process quotes file',
        details: error.message,
      }
    }
  }

  @inject()
  async update({ request }: HttpContext, service: UpdateQuoteService) {
    const data: UpdateQuoteRequest = await request.validateUsing(updateQuoteValidator)

    return await service.handle(request.param('id'), data)
  }

  @inject()
  async delete({ request }: HttpContext, service: DeleteQuoteService) {
    return await service.handle(request.param('id'))
  }
}
