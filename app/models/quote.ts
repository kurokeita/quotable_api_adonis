import { compose } from '@adonisjs/core/helpers'
import { BaseModel, belongsTo, column, computed, manyToMany, scope } from '@adonisjs/lucid/orm'
import type { ModelObject, ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'
import type { BelongsTo, ManyToMany } from '@adonisjs/lucid/types/relations'
import { SoftDeletes } from 'adonis-lucid-soft-deletes'
import { DateTime } from 'luxon'
import Author from './author.js'
import Tag from './tag.js'

export default class Quote extends compose(BaseModel, SoftDeletes) {
  @column({ isPrimary: true })
  declare id: number

  @column({ serializeAs: null })
  declare authorId: number

  @column()
  declare content: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column.dateTime({ serializeAs: null })
  declare deletedAt: DateTime

  @belongsTo(() => Author)
  declare author: BelongsTo<typeof Author>

  @manyToMany(() => Tag)
  declare tags: ManyToMany<typeof Tag>

  @computed()
  get length(): number {
    return this.content.length
  }

  static queryBasicRelationships = scope((query: ModelQueryBuilderContract<typeof Quote>) => {
    query.preload('tags').preload('author')
  })

  serialize(): ModelObject {
    const serializedData = super.serialize()

    if (this.$preloaded && this.$preloaded.author) {
      const author = this.$preloaded.author as Author
      serializedData.author = author?.name
    }

    if (this.$preloaded && this.$preloaded.tags) {
      const tags = this.$preloaded.tags as Array<Tag>
      serializedData.tags = tags.map((t) => t.name)
    }

    return serializedData
  }
}
