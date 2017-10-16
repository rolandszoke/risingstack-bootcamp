'use strict'

const joi = require('joi')
const compose = require('koa-compose')
const middleware = require('../../middleware')
const contribution = require('../../../models/contribution')

const schema = joi.object({
  id: joi.number().integer().required()
}).required()

async function getById(ctx) {
  const result = await contribution.read(ctx.params)
  if (!result) ctx.status = 404
  else ctx.body = result
}

module.exports = compose([
  middleware.validator({ params: schema }),
  getById
])
