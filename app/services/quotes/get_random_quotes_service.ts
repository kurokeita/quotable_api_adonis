import { GetRandomQuotesRequest } from '#requests/quotes'
import QuoteService from '#services/quotes/quote_service'

export default class GetRandomQuotesService extends QuoteService {
  async handle(data: GetRandomQuotesRequest) {
    return await this.repository().getRandomQuotes(data)
  }
}
