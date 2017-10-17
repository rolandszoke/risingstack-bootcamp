'use strict'

const config = require('./config')
const knex = require('knex')

const db = knex(config)

async function healthCheck() {
  // send simple select to check db status
  try {
    await db.select(1).timeout(config.healthCheck)
  } catch (err) {
    throw new Error('DB health error!')
  }
}

module.exports = Object.assign(db, {
  healthCheck
})
