import { OrderEnum } from '#enums/order_enum'
import { QuotesOrderByEnum } from '#enums/quotes'
import { getDefaultValue } from '#utils/helpers'
import vine from '@vinejs/vine'

export const indexAllQuotesValidator = vine.compile(
  vine.object({
    sortBy: vine
      .enum(QuotesOrderByEnum)
      .parse((v: unknown) => getDefaultValue(v, QuotesOrderByEnum.CREATED_AT)),
    order: vine.enum(OrderEnum).parse((v: unknown) => getDefaultValue(v, OrderEnum.ASC)),
    author: vine.string().optional(),
    tags: vine.string().optional(),
    minLength: vine.number().optional(),
    maxLength: vine.number().optional(),
    limit: vine
      .number()
      .min(10)
      .parse((v: unknown) => getDefaultValue(v, 10)),
    page: vine
      .number()
      .min(1)
      .parse((v: unknown) => getDefaultValue(v, 1)),
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
    sortBy: vine
      .enum(QuotesOrderByEnum)
      .parse((v: unknown) => getDefaultValue(v, QuotesOrderByEnum.CREATED_AT)),
    order: vine.enum(OrderEnum).parse((v: unknown) => getDefaultValue(v, OrderEnum.ASC)),
    author: vine.string().optional(),
    tags: vine.string().optional(),
    minLength: vine.number().optional(),
    maxLength: vine.number().optional(),
    query: vine.string().optional(),
    limit: vine
      .number()
      .min(10)
      .parse((v: unknown) => getDefaultValue(v, 10)),
  })
)

export const newQuoteSchema = vine.object({
  authorId: vine.number().optional().requiredIfMissing('author'),
  author: vine.string().optional().requiredIfMissing('authorId'),
  content: vine.string(),
  tags: vine.array(vine.string()).optional(),
})

export const createQuoteValidator = vine.compile(newQuoteSchema)

export const updateQuoteValidator = vine.compile(
  vine.object({
    content: vine.string().optional(),
    tags: vine.array(vine.string()).optional(),
  })
)

export const massCreateQuotesValidator = vine.compile(
  vine.object({
    quotes: vine.array(newQuoteSchema).distinct('content'),
  })
)
