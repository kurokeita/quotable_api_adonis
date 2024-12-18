import {
  createQuoteValidator,
  getRandomQuotesValidator,
  getRandomQuoteValidator,
  indexAllQuotesValidator,
  massCreateQuotesValidator,
  updateQuoteValidator,
} from '#validators/quote'
import { InferInput } from '@vinejs/vine/types'
import { CreateAuthorRequest } from './authors.js'

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
  authorId: number | null | undefined
}

export type UpdateQuoteRequest = InferInput<typeof updateQuoteValidator>

export type MassCreateQuotesRequest = Omit<
  InferInput<typeof massCreateQuotesValidator>,
  'quotes'
> & {
  quotes: CreateQuoteRequest[]
}

export type UploadFileContentRequest = {
  authors: CreateAuthorRequest[]
  quotes: CreateQuoteRequest[]
}
