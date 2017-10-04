'use strict'

const tableName = 'repository'

function up(knex) { // logic
  return knex.schema.createTable(tableName, (table) => {
    table.integer('id').primary().unsigned()
    table.integer('owner').notNullable()
    table.string('full_name').notNullable()
    table.string('description').notNullable()
    table.string('html_url').notNullable()
    table.string('language').notNullable()
    table.integer('stargazers').notNullable().unsigned()
    table.foreign('owner').references('user.id').onDelete('CASCADE')
  })
}

function down(knex) { // reverting
  return knex.schema.dropTableIfExists(tableName)
}

module.exports = {
  up,
  down
}