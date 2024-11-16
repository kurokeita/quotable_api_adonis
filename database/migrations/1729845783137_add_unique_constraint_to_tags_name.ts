import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'tags'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // Drop the existing index
      table.dropIndex('name')
      // Add unique constraint
      table.unique(['name'])
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      // Drop unique constraint
      table.dropUnique(['name'])
      // Recreate the index
      table.index('name')
    })
  }
}
