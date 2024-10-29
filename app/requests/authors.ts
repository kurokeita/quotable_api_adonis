import {
  createAuthorsValidator,
  createAuthorValidator,
  indexAllAuthorsValidator,
  updateAuthorValidator,
} from '#validators/author'
import { InferInput } from '@vinejs/vine/types'

export type IndexAllAuthorsRequest = Omit<
  InferInput<typeof indexAllAuthorsValidator>,
  'page' | 'limit'
> & {
  page: number
  limit: number
}

export type CreateAuthorRequest = InferInput<typeof createAuthorValidator>

export type CreateAuthorsRequest = InferInput<typeof createAuthorsValidator>

export type UpdateAuthorRequest = InferInput<typeof updateAuthorValidator>
