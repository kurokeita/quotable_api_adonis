import { QuotesOrderByEnum } from '#enums/quotes'
import { SortEnum } from '#enums/sort_enum'
import vine from '@vinejs/vine'

export const indexAllQuotesValidator = vine.compile(
  vine.object({
    sortBy: vine.enum(QuotesOrderByEnum).optional(),
    order: vine.enum(SortEnum).optional(),
    author: vine.string().optional(),
    tags: vine.string().optional(),
    minLength: vine.number().optional(),
    maxLength: vine.number().optional(),
    limit: vine.number().min(10).optional(),
    page: vine.number().min(1).optional(),
  })
)

export const getRandomQuoteValidator = vine.compile(
  vine.object({
    author: vine.string().optional(),
    tags: vine.string().optional(),
    minLength: vine.number().optional(),
    maxLength: vine.number().optional(),
    query: vine.string().optional(),
  })
)

export const getRandomQuotesValidator = vine.compile(
  vine.object({
    sortBy: vine.enum(QuotesOrderByEnum).optional(),
    order: vine.enum(SortEnum).optional(),
    author: vine.string().optional(),
    tags: vine.string().optional(),
    minLength: vine.number().optional(),
    maxLength: vine.number().optional(),
    query: vine.string().optional(),
    limit: vine.number().min(10).optional(),
  })
)