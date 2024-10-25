import type { HttpContext } from '@adonisjs/core/http'

import { IndexAllQuotesRequest } from '#requests/quotes'
import IndexAllQuoteSerive from '#services/quotes/index_all_quote_service'
import { indexAllQuotesValidator } from '#validators/quote'
import { inject } from '@adonisjs/core'

export default class QuotesController {
  @inject()
  async index({ request }: HttpContext, service: IndexAllQuoteSerive) {
    const query = request.qs()

    const data: IndexAllQuotesRequest = await indexAllQuotesValidator.validate(query)

    const result = await service.handle(data)

    return result
  }
}
