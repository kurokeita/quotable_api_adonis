import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'tags'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.bigIncrements('id')
      table.string('name').index()

      table.timestamp('created_at').defaultTo(this.raw('CURRENT_TIMESTAMP')).notNullable()
      table.timestamp('updated_at').defaultTo(this.raw('CURRENT_TIMESTAMP')).notNullable()
      table.timestamp('deleted_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
