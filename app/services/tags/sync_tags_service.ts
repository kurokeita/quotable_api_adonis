import Quote from '#models/quote'
import TagService from './tag_service.js'

export default class SyncTagsService extends TagService {
  async handle(quote: Quote, tags: string[]) {
    const existedTags = await this.repository().getByNames(tags)

    const newTags = await this.repository().createMultiple(
      tags.filter((tag) => !existedTags.find((existedTag) => existedTag.name === tag))
    )

    await quote.related('tags').sync([...existedTags, ...newTags].map((t) => t.id))

    await quote.load('tags')

    return quote
  }
}
