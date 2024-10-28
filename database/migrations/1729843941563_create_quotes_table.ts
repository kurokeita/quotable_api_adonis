import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'quotes'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.bigIncrements('id')
      table.bigInteger('author_id').unsigned().references('authors.id')
      table.text('content')

      table.timestamp('created_at').defaultTo(this.raw('CURRENT_TIMESTAMP'))
      table.timestamp('updated_at').defaultTo(this.raw('CURRENT_TIMESTAMP'))
      table.timestamp('deleted_at')

      table.index('content', 'content_index', 'FULLTEXT')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
