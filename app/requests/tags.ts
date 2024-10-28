import { indexAllTagsValidator } from '#validators/tag'
import { InferInput } from '@vinejs/vine/types'

export type IndexAllTagsRequest = InferInput<typeof indexAllTagsValidator>
