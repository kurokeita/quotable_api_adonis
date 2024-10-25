import vine from '@vinejs/vine'

export const indexAllQuotesValidator = vine.compile(
  vine.object({
    sortBy: vine.enum(['created_at', 'updated_at', 'content']).optional(),
    order: vine.enum(['asc', 'desc']).optional(),
    author: vine.string().optional(),
    tags: vine.string().optional(),
    minLength: vine.number().optional(),
    maxLength: vine.number().optional(),
    limit: vine.number().min(10).optional(),
    page: vine.number().min(1).optional(),
  })
)
