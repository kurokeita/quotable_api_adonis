import Author from '#models/author'
import slugify from '#utils/slugify'
import factory from '@adonisjs/lucid/factories'

export const AuthorFactory = factory
  .define(Author, async ({ faker }) => {
    const person = faker.person

    return {
      slug: slugify(person.fullName()),
      name: person.fullName(),
      link: faker.internet.url(),
      bio: person.bio(),
      description: person.jobDescriptor(),
    }
  })
  .build()
