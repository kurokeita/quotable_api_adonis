import { UploadFileContentRequest } from '#requests/quotes'
import MassCreateAuthorsService from '#services/authors/mass_create_authors_service'
import { createAuthorsValidator } from '#validators/author'
import { massCreateQuotesValidator } from '#validators/quote'
import { inject } from '@adonisjs/core'
import { MultipartFile } from '@adonisjs/core/bodyparser'
import * as fs from 'node:fs'
import MassCreateQuotesService, { SkippedQuote } from './mass_create_quote_service.js'

@inject()
export default class UploadService {
  constructor(
    private massCreateAuthorsService: MassCreateAuthorsService,
    private massCreateQuotesService: MassCreateQuotesService
  ) {}

  public async handle(file: MultipartFile) {
    // Read file content using tmpPath for temporary files
    const content = await fs.promises.readFile(file.tmpPath!)
    const jsonContent: UploadFileContentRequest = JSON.parse(content.toString())

    let authors = {
      input: 0,
      skipped: 0,
      created: 0,
    }
    if (jsonContent.authors && jsonContent.authors.length > 0) {
      const authorsData = await createAuthorsValidator.validate({ authors: jsonContent.authors })

      authors = await this.massCreateAuthorsService.handle(authorsData)
    }

    let quotes = {
      inputCount: 0,
      createdCount: 0,
      skippedCount: 0,
      skipped: [] as SkippedQuote[],
    }
    if (jsonContent.quotes && jsonContent.quotes.length > 0) {
      const quotesData = await massCreateQuotesValidator.validate({ quotes: jsonContent.quotes })

      quotes = await this.massCreateQuotesService.handle(quotesData)
    }

    // Process the quotes using the service
    return {
      authors: authors,
      quotes: quotes,
    }
  }
}
