'use strict'

const joi = require('joi')
const compose = require('koa-compose')
const middleware = require('../../middleware')
const repository = require('../../../models/repository')

const schema = joi.object({
  id: joi.number().integer().required()
}).required()

async function getById(ctx) {
  const result = await repository.read(ctx.params)
  if (!result) ctx.status = 404
  else ctx.body = result
}

module.exports = compose([
  middleware.validator({ params: schema }),
  getById
])
