import QuoteService from '#services/quotes/quote_service'

export default class GetQuoteByIdService extends QuoteService {
  async handle(id: number) {
    return await this.repository().getById(id)
  }
}
