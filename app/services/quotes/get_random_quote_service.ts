import { GetRandomQuoteRequest } from '#requests/quotes'
import QuoteService from '#services/quotes/quote_service'

export default class GetRandomQuoteService extends QuoteService {
  async handle(data: GetRandomQuoteRequest) {
    return await this.repository().getRandomQuote(data)
  }
}
