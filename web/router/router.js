'use strict'

const Router = require('koa-router')

const router = new Router()

router.get('/hello', (ctx) => {
  ctx.body = 'Hello Node.js!'
}) // basic koa route

module.exports = router
