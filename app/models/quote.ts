import {
  BaseModel,
  beforeFetch,
  beforeFind,
  belongsTo,
  column,
  manyToMany,
} from '@adonisjs/lucid/orm'
import type { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'
import type { BelongsTo, ManyToMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import Author from './author.js'
import Tag from './tag.js'

export default class Quote extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column({ serializeAs: null })
  declare authorId: number

  @column()
  declare content: string

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

  @belongsTo(() => Author)
  declare author: BelongsTo<typeof Author>

  @manyToMany(() => Tag)
  declare tags: ManyToMany<typeof Tag>

  @beforeFetch()
  @beforeFind()
  static ignoreDeleted(query: ModelQueryBuilderContract<typeof Quote>) {
    query.whereNull('deleted_at')
  }

  @beforeFetch()
  @beforeFind()
  static withTags(query: ModelQueryBuilderContract<typeof Quote>) {
    query.preload('tags').preload('author')
  }
}
