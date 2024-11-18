import Author from '#models/author'
import { CreateAuthorsRequest } from '#requests/authors'
import AuthorService from '#services/authors/author_service'
import db from '@adonisjs/lucid/services/db'
import { TransactionClientContract } from '@adonisjs/lucid/types/database'

export interface SkippedAuthor {
  author: CreateAuthorsRequest['authors'][0]
  reason: 'DUPLICATE'
  details: string
}

interface Result {
  input: number
  created: number
  skipped: number
  skippedAuthors: SkippedAuthor[]
}

export default class MassCreateAuthorsService extends AuthorService {
  private CHUNK_SIZE = 500

  async handle(inputs: CreateAuthorsRequest): Promise<Result> {
    const trx = await db.transaction()

    try {
      // Create chunks once
      const chunks = this.createChunks(inputs.authors)

      if (chunks.length === 0) {
        await trx.commit()
        return { input: 0, created: 0, skipped: 0, skippedAuthors: [] }
      }

      let totalSkipped = 0
      let totalCreated = 0
      const skippedAuthors: SkippedAuthor[] = []

      // Process each chunk
      for (const chunk of chunks) {
        // Filter existing authors in this chunk
        const { newAuthors, skipped } = await this.filterExistingAuthors(chunk, trx)
        totalSkipped += skipped.length
        skippedAuthors.push(...skipped)

        if (newAuthors.length > 0) {
          // Create new authors from this chunk
          const created = await this.createAuthors(newAuthors, trx)
          totalCreated += created.length
        }
      }

      await trx.commit()
      return {
        input: inputs.authors.length,
        created: totalCreated,
        skipped: totalSkipped,
        skippedAuthors,
      }
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }

  /**
   * Creates chunks from input array
   */
  private createChunks(authors: CreateAuthorsRequest['authors']) {
    return Array.from({ length: Math.ceil(authors.length / this.CHUNK_SIZE) }, (_, i) =>
      authors.slice(i * this.CHUNK_SIZE, (i + 1) * this.CHUNK_SIZE)
    ).filter((chunk) => chunk.length > 0)
  }

  /**
   * Filters out authors that already exist in the database and tracks skipped authors
   */
  private async filterExistingAuthors(
    authors: CreateAuthorsRequest['authors'],
    trx: TransactionClientContract
  ): Promise<{ newAuthors: CreateAuthorsRequest['authors']; skipped: SkippedAuthor[] }> {
    if (authors.length === 0) return { newAuthors: [], skipped: [] }

    // Get existing authors
    const names = authors.map((author) => author.name)
    const existingAuthors = await this.repository().getByNames(names, {
      withQuoteCount: false,
      transaction: trx,
    })

    // Use Set for O(1) lookup of existing names
    const existingNames = new Set(existingAuthors.map((author) => author.name.toLowerCase()))

    const newAuthors: CreateAuthorsRequest['authors'] = []
    const skipped: SkippedAuthor[] = []

    // Separate new and existing authors
    for (const author of authors) {
      if (existingNames.has(author.name.toLowerCase())) {
        skipped.push({
          author,
          reason: 'DUPLICATE',
          details: `Author with name "${author.name}" already exists`,
        })
      } else {
        newAuthors.push(author)
      }
    }

    return { newAuthors, skipped }
  }

  /**
   * Creates new authors
   */
  private async createAuthors(
    authors: CreateAuthorsRequest['authors'],
    trx: TransactionClientContract
  ) {
    if (authors.length === 0) return []

    return await this.repository().createMultiple(
      authors.map((author) => ({ ...author, slug: Author.getSlug(author.name) }) as Author),
      { transaction: trx }
    )
  }
}
