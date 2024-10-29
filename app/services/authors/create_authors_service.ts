import Author from '#models/author'
import { CreateAuthorsRequest } from '#requests/authors'
import AuthorService from '#services/authors/author_service'
import slugify from '#utils/slugify'

export default class CreateAuthorsService extends AuthorService {
  async handle(inputs: CreateAuthorsRequest) {
    const existAuthors = await this.repository().getByNames(
      inputs.authors.map((author) => author.name)
    )

    // Filter out authors that already exist in the database.
    return await this.repository().createMultiple(
      inputs.authors
        .filter((author) => !existAuthors.some((a) => author.name === a.name))
        .map((author) => ({ ...author, slug: slugify(author.name) }) as Author)
    )
  }
}
