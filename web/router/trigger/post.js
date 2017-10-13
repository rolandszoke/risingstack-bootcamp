'use strict'

const joi = require('joi')
const compose = require('koa-compose')
const middleware = require('../../middleware')
const redis = require('../../../models/redis')

const { CHANNELS } = redis

const schema = joi.object({
  query: joi.string().required()
}).required()

async function post(ctx) {
  await redis.publishObject(CHANNELS.collect.trigger.v1, {
    date: new Date().toISOString(),
    query: ctx.request.body.query
  })
  ctx.status = 201
}

module.exports = compose([
  middleware.validator({ body: schema }),
  post
])
