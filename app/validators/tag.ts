import { OrderEnum } from '#enums/order_enum'
import { TagsSortByEnum } from '#enums/tags'
import vine from '@vinejs/vine'

export const indexAllTagsValidator = vine.compile(
  vine.object({
    sortBy: vine
      .enum(TagsSortByEnum)
      .parse((v: unknown) => (v === undefined || v === null ? TagsSortByEnum.CREATED_AT : v)),
    order: vine
      .enum(OrderEnum)
      .parse((v: unknown) => (v === undefined || v === null ? OrderEnum.ASC : v)),
  })
)
