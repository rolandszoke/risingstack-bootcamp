'use strict'

const logger = require('winston')
const db = require('../../../models/db')
const redis = require('../../../models/redis')

let isShutingdown = false

process.on('SIGTERM', () => {
  isShutingdown = true
})

async function getHealth(ctx) {
  if (isShutingdown) ctx.throw(503, 'Service is shutting down')

  try {
    await db.healthCheck()
  } catch (err) {
    const message = 'Database health check failed'
    logger.error(message, err)
    ctx.throw(500, message)
  }

  try {
    await redis.healthCheck()
  } catch (err) {
    const message = 'Redis health check failed'
    logger.error(message, err)
    ctx.throw(500, message)
  }

  ctx.body = { status: 'ok' }
}

module.exports = getHealth
