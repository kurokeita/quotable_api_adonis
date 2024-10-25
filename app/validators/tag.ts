import vine from '@vinejs/vine'

export const indexAllTagsValidator = vine.compile(
  vine.object({
    order: vine.enum(['asc', 'desc']).optional(),
  })
)
