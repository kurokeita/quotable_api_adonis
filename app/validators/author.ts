import vine from '@vinejs/vine'

export const indexAllAuthorsValidator = vine.compile(
  vine.object({
    limit: vine
      .number()
      .optional()
      .transform((value) => Number.parseInt(value.toString())),
    page: vine.number().optional(),
    slug: vine.string().optional(),
    sortBy: vine.enum(['name', 'created_at', 'updated_at']).optional(),
    order: vine.enum(['asc', 'desc']).optional(),
  })
)
