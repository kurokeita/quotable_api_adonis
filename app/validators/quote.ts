import { OrderEnum } from '#enums/order_enum'
import { QuotesOrderByEnum } from '#enums/quotes'
import AuthorRepository from '#repositories/author_repository'
import { getDefaultValue } from '#utils/helpers'
import app from '@adonisjs/core/services/app'
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

export const createQuoteValidator = vine.compile(
  vine.object({
    authorId: vine
      .number()
      .exists(async (_db, value) => {
        const authorRepository = await app.container.make(AuthorRepository)
        return (
          (await authorRepository.getById(Number.parseInt(value), { findOrFail: false })) !== null
        )
      })
      .optional()
      .requiredIfMissing('author'),
    author: vine.string().optional().requiredIfMissing('authorId'),
    content: vine.string(),
    tags: vine.array(vine.string()).optional(),
  })
)

export const updateQuoteValidator = vine.compile(
  vine.object({
    content: vine.string().optional(),
    tags: vine.array(vine.string()).optional(),
  })
)
