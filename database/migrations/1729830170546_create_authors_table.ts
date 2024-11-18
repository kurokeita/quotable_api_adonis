import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'authors'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.bigIncrements('id').index()
      table.string('slug').notNullable().index().unique()
      table.string('name').notNullable().index()
      table.string('link').defaultTo('')
      table.text('bio').defaultTo('')
      table.text('description').defaultTo('')

      table.timestamp('created_at').defaultTo(this.raw('CURRENT_TIMESTAMP')).notNullable()
      table.timestamp('updated_at').defaultTo(this.raw('CURRENT_TIMESTAMP')).notNullable()
      table.timestamp('deleted_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
