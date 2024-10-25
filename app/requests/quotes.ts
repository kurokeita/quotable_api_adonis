import { getRandomQuoteValidator, indexAllQuotesValidator } from '#validators/quote'
import { InferInput } from '@vinejs/vine/types'

export type IndexAllQuotesRequest = Omit<
  InferInput<typeof indexAllQuotesValidator>,
  'page' | 'limit' | 'minLength' | 'maxLength'
> & {
  minLength?: number
  maxLength?: number
  page?: number
  limit?: number
}

export type GetRandomQuoteRequest = Omit<
  InferInput<typeof getRandomQuoteValidator>,
  'minLength' | 'maxLength'
> & {
  minLength?: number
  maxLength?: number
}
