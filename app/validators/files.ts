import vine from '@vinejs/vine'

export const jsonFileValidator = vine.compile(
  vine.object({
    file: vine.file({
      extnames: ['json'],
    }),
  })
)
