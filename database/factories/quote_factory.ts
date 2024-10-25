import Quote from '#models/quote'
import factory from '@adonisjs/lucid/factories'
import { AuthorFactory } from './author_factory.js'
import { TagFactory } from './tag_factory.js'

export const QuoteFactory = factory
  .define(Quote, async ({ faker }) => {
    return {
      content: faker.lorem.sentence(),
    }
  })
  .relation('author', () => AuthorFactory)
  .relation('tags', () => TagFactory)
  .build()
