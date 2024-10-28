import { IndexAllQuotesRequest } from '#requests/quotes'
import QuoteService from '#services/quotes/quote_service'

export default class IndexAllQuoteSerive extends QuoteService {
  async handle(data: IndexAllQuotesRequest) {
    return await this.repository().index(data)
  }
}
