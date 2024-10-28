import { AuthorsSortByEnum } from '#enums/authors'
import { OrderEnum } from '#enums/order_enum'
import { getDefaultValue } from '#utils/helpers'
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
