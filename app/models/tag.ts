import {
  BaseModel,
  beforeFetch,
  beforeFind,
  column,
  computed,
  manyToMany,
  scope,
} from '@adonisjs/lucid/orm'
import type { ModelObject, ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import Quote from './quote.js'

export default class Tag extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column.dateTime({ serializeAs: null })
  declare deletedAt: DateTime

  @manyToMany(() => Quote)
  declare quotes: ManyToMany<typeof Quote>

  @computed()
  get quoteCount(): number | null {
    return this.$extras?.quoteCount ?? null
  }

  @beforeFetch()
  @beforeFind()
  static ignoreDeleted(query: ModelQueryBuilderContract<typeof Tag>) {
    query.whereNull('deleted_at')
  }

  static withQuoteCount = scope((query: ModelQueryBuilderContract<typeof Tag>) => {
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
