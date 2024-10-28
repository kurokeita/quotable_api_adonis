import { OrderEnum } from '#enums/order_enum'
import { TagsSortByEnum } from '#enums/tags'
import { getDefaultValue } from '#utils/helpers'
import vine from '@vinejs/vine'

export const indexAllTagsValidator = vine.compile(
  vine.object({
    sortBy: vine
      .enum(TagsSortByEnum)
      .parse((v: unknown) => getDefaultValue(v, TagsSortByEnum.CREATED_AT)),
    order: vine.enum(OrderEnum).parse((v: unknown) => getDefaultValue(v, OrderEnum.ASC)),
  })
)
