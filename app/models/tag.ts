import { BaseModel, beforeFetch, beforeFind, column, manyToMany } from '@adonisjs/lucid/orm'
import type { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import Quote from './quote.js'

export default class Tag extends BaseModel {
  @column({ isPrimary: true, serializeAs: null })
  declare id: number

  @column()
  declare name: string

  @column.dateTime({
    autoCreate: true,
    serialize: (value: DateTime) => value.toFormat('yyyy-MM-dd'),
  })
  declare createdAt: DateTime

  @column.dateTime({
    autoCreate: true,
    serialize: (value: DateTime) => value.toFormat('yyyy-MM-dd'),
    autoUpdate: true,
  })
  declare updatedAt: DateTime

  @column.dateTime({ serializeAs: null })
  declare deletedAt: DateTime

  @manyToMany(() => Quote)
  declare quotes: ManyToMany<typeof Quote>

  @beforeFetch()
  @beforeFind()
  static ignoreDeleted(query: ModelQueryBuilderContract<typeof Tag>) {
    query.whereNull('deleted_at')
  }

  serializeExtras() {
    return {
      quoteCount: this.$extras.quotes_count,
    }
  }
}
