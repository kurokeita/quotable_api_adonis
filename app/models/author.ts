import {
  BaseModel,
  beforeFetch,
  beforeFind,
  column,
  computed,
  hasMany,
  scope,
} from '@adonisjs/lucid/orm'
import type { ModelObject, ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import Quote from './quote.js'

export default class Author extends BaseModel {
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
  declare deletedAt: DateTime

  @hasMany(() => Quote)
  declare quotes: HasMany<typeof Quote>

  @computed()
  get quoteCount(): number | null {
    return this.$extras?.quoteCount ?? null
  }

  @beforeFetch()
  @beforeFind()
  static ignoreDeleted(query: ModelQueryBuilderContract<typeof Author>) {
    query.whereNull('deleted_at')
  }

  static withQuoteCount = scope((query: ModelQueryBuilderContract<typeof Author>) => {
    query.withCount('quotes', (q) => q.as('quoteCount'))
  })

  serialize(): ModelObject {
    const serializedData = super.serialize()

    // If quoteCount is not loaded, do not serialize it in the response
    if (this.quoteCount === null) {
      delete serializedData.quoteCount
    }

    return serializedData
  }
}
