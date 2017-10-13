'use strict'

const Koa = require('koa')
const logger = require('winston')
const router = require('./router')
const middleware = require('./middleware')

const app = new Koa()

app
  .use(router.routes())
  .use(router.allowedMethods())
  .use(middleware.requestLogger())

app.on('error', (err) => {
  logger.error('Server error', { error: err.message })
})

module.exports = app
