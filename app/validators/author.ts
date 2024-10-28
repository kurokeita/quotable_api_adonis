import { AuthorsSortByEnum } from '#enums/authors'
import { OrderEnum } from '#enums/order_enum'
import vine from '@vinejs/vine'

export const indexAllAuthorsValidator = vine.compile(
  vine.object({
    limit: vine
      .number()
      .min(10)
      .max(50)
      .parse((v: unknown) => (v === undefined || v === null ? 10 : v)),
    page: vine
      .number()
      .min(1)
      .parse((v: unknown) => (v === undefined || v === null ? 1 : v)),
    slug: vine.string().optional(),
    sortBy: vine
      .enum(AuthorsSortByEnum)
      .parse((v: unknown) => (v === undefined || v === null ? AuthorsSortByEnum.CREATED_AT : v)),
    order: vine
      .enum(OrderEnum)
      .parse((v: unknown) => (v === undefined || v === null ? OrderEnum.ASC : v)),
  })
)
