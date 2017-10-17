'use strict'

const { promisify } = require('util')
const logger = require('winston')
const http = require('http')
const config = require('./config')
const db = require('../models/db')
const redis = require('../models/redis')
const app = require('./server')
const worker = require('./worker')

const server = http.createServer(app.callback())
const serverListen = promisify(server.listen).bind(server)
const serverClose = promisify(server.close).bind(server)

Promise.all([serverListen(config.port), worker.init()])
  .then(() => {
    logger.info(`Server is listening on port ${config.port}`)
    logger.info('Worker is running')
  })
  .catch((err) => {
    logger.error('Error happened', err)
    process.exit(1)
  })

process.on('SIGTERM', gracefulShutdon)
let isShutingdown = false

async function gracefulShutdon() {
  if (isShutingdown) return
  isShutingdown = true
  try {
    await serverClose()
    await db.destroy()
    await redis.destroy()
  } catch (err) {
    process.exit(1)
  }
  process.exit(0)
}
