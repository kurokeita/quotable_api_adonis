import { indexAllAuthorsValidator } from '#validators/author'
import { InferInput } from '@vinejs/vine/types'

export type IndexAllAuthorsRequest = Omit<
  InferInput<typeof indexAllAuthorsValidator>,
  'page' | 'limit'
> & {
  page?: number
  limit?: number
}
