import { AuthorsSortByEnum } from '#enums/authors'
import { OrderEnum } from '#enums/order_enum'
import AuthorRepository from '#repositories/author_repository'
import { getDefaultValue } from '#utils/helpers'
import app from '@adonisjs/core/services/app'
import vine from '@vinejs/vine'

export const indexAllAuthorsValidator = vine.compile(
  vine.object({
    limit: vine
      .number()
      .min(10)
      .max(50)
      .parse((v: unknown) => getDefaultValue(v, 10)),
    page: vine
      .number()
      .min(1)
      .parse((v: unknown) => getDefaultValue(v, 1)),
    slug: vine.string().optional(),
    sortBy: vine
      .enum(AuthorsSortByEnum)
      .parse((v: unknown) => getDefaultValue(v, AuthorsSortByEnum.CREATED_AT)),
    order: vine.enum(OrderEnum).parse((v: unknown) => getDefaultValue(v, OrderEnum.ASC)),
  })
)

const createAuthorSchema = vine.object({
  name: vine.string(),
  link: vine.string().url(),
  bio: vine.string(),
  description: vine.string(),
})

export const createAuthorValidator = vine.compile(
  vine.object({
    ...createAuthorSchema.getProperties(),
    name: vine.string().unique(async (_db, value) => {
      const authorRepository = await app.container.make(AuthorRepository)
      return !(await authorRepository.exists(value))
    }),
  })
)

export const createAuthorsValidator = vine.compile(
  vine.object({
    authors: vine.array(createAuthorSchema).distinct('name'),
  })
)
