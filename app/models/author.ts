import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column, computed, hasMany, scope } from '@adonisjs/lucid/orm'
import type { ModelObject, ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import { SoftDeletes } from 'adonis-lucid-soft-deletes'
import { DateTime } from 'luxon'
import Quote from './quote.js'
import slugify from '#utils/slugify'

export default class Author extends compose(BaseModel, SoftDeletes) {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare slug: string

  @column()
  declare name: string

  @column()
  declare link: string

  @column()
  declare bio: string

  @column()
  declare description: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column.dateTime({ serializeAs: null })
  declare deletedAt: DateTime | null

  @hasMany(() => Quote)
  declare quotes: HasMany<typeof Quote>

  @computed()
  get quoteCount(): number | null {
    return this.$extras?.quoteCount ?? null
  }

  static withQuoteCount = scope((query: ModelQueryBuilderContract<typeof Author>) => {
    query.withCount('quotes', (q) => q.as('quoteCount'))
  })

  static getSlug = (name: string) => slugify(name, { lower: true })

  serialize(): ModelObject {
    const serializedData = super.serialize()

    // If quoteCount is not loaded, do not serialize it in the response
    if (this.quoteCount === null) {
      delete serializedData.quoteCount
    }

    return serializedData
  }
}
