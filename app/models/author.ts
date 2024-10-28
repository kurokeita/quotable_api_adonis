import { BaseModel, beforeFetch, beforeFind, column, hasMany } from '@adonisjs/lucid/orm'
import type { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'
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

  @column.dateTime({
    autoCreate: true,
    serialize: (value: DateTime) => value.toFormat('yyyy-MM-dd'),
  })
  declare createdAt: DateTime

  @column.dateTime({
    autoCreate: true,
    autoUpdate: true,
    serialize: (value: DateTime) => value.toFormat('yyyy-MM-dd'),
  })
  declare updatedAt: DateTime

  @column.dateTime({ serializeAs: null })
  declare deletedAt: DateTime

  @hasMany(() => Quote)
  declare quotes: HasMany<typeof Quote>

  @beforeFetch()
  @beforeFind()
  static ignoreDeleted(query: ModelQueryBuilderContract<typeof Author>) {
    query.whereNull('deleted_at')
  }
}
