import Author from '#models/author'
import factory from '@adonisjs/lucid/factories'

export const AuthorFactory = factory
  .define(Author, async ({ faker }) => {
    const person = faker.person

    return {
      slug: Author.getSlug(person.fullName()),
      name: person.fullName(),
      link: faker.internet.url(),
      bio: person.bio(),
      description: person.jobDescriptor(),
    }
  })
  .build()
