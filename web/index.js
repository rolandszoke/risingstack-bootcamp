'use strict'

const { promisify } = require('util')
const logger = require('winston')
const http = require('http')
const config = require('./config')
const db = require('../models/db')
const redis = require('../models/redis')
const app = require('./server')

const server = http.createServer(app.callback())
const serverListen = promisify(server.listen).bind(server)
const serverClose = promisify(server.close).bind(server)

serverListen(config.port)
  .then(() => logger.info(`Server is listening on port ${config.port}`))
  .catch((err) => {
    logger.error('Error happened during server start', err)
    process.exit(1)
  })

// process.emit('SIGTERM') to send the sigterm
process.on('SIGTERM', gracefulShutdown)
let isShutingdown = false

async function gracefulShutdown() {
  logger.info('Server got SIGTERM signal')
  if (isShutingdown) return
  isShutingdown = true
  try {
    await serverClose()
    await db.destroy()
    await redis.destroy()
  } catch (err) {
    logger.info('Error happened during Graceful shutdown', err)
    process.exit(1)
  }
  logger.info('Graceful shutdown finished')
  process.exit(0)
}
