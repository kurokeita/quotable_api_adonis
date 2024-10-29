import {
  createQuoteValidator,
  getRandomQuotesValidator,
  getRandomQuoteValidator,
  indexAllQuotesValidator,
  updateQuoteValidator,
} from '#validators/quote'
import { InferInput } from '@vinejs/vine/types'

export type IndexAllQuotesRequest = Omit<
  InferInput<typeof indexAllQuotesValidator>,
  'page' | 'limit' | 'minLength' | 'maxLength'
> & {
  minLength?: number
  maxLength?: number
  page: number
  limit: number
}

export type GetRandomQuoteRequest = Omit<
  InferInput<typeof getRandomQuoteValidator>,
  'minLength' | 'maxLength'
> & {
  minLength?: number
  maxLength?: number
}

export type GetRandomQuotesRequest = Omit<
  InferInput<typeof getRandomQuotesValidator>,
  'limit' | 'minLength' | 'maxLength'
> & {
  minLength?: number
  maxLength?: number
  limit: number
}

export type CreateQuoteRequest = Omit<InferInput<typeof createQuoteValidator>, 'authorId'> & {
  authorId: number
}

export type UpdateQuoteRequest = InferInput<typeof updateQuoteValidator>
