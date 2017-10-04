'use strict'

const tableName = 'user'

function up(knex) { // logic
  return knex.schema.createTable(tableName, (table) => {
    table.integer('id').primary().unsigned()
    table.string('login').notNullable()
    table.string('avatar_url').notNullable()
    table.string('html_url').notNullable()
    table.string('type').notNullable()
  })
}

function down(knex) { // reverting
  return knex.schema.dropTableIfExists(tableName)
}

module.exports = {
  up,
  down
}