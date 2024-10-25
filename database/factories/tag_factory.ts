import Tag from '#models/tag'
import factory from '@adonisjs/lucid/factories'

export const TagFactory = factory
  .define(Tag, async ({ faker }) => {
    return {
      name: faker.word.noun(),
    }
  })
  .build()
