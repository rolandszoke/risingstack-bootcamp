'use strict'

const tableName = 'contribution'

function up(knex) { // logic
  return knex.schema.createTable(tableName, (table) => {
    table.integer('user').unsigned()
    table.integer('repository').notNullable()
    table.integer('line_count').notNullable()
    table.primary(['user', 'repository'])
    table.foreign('user').references('user.id').onDelete('CASCADE')
    table.foreign('repository').references('repository.id').onDelete('CASCADE')
  })
}

function down(knex) { // reverting
  return knex.schema.dropTableIfExists(tableName)
}

module.exports = {
  up,
  down
}