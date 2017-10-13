'use strict'

const joi = require('joi')
const compose = require('koa-compose')
const middleware = require('../../middleware')
const repository = require('../../../models/repository')

const schema = joi.object({
  owner: joi.string().required(),
  name: joi.string().required()
}).required()

async function getByName(ctx) {
  const fullName = `${ctx.params.owner}/${ctx.params.name}`
  const result = await repository.read({ full_name: fullName })
  if (!result) ctx.status = 404
  else ctx.body = result
}

module.exports = compose([
  middleware.validator({ params: schema }),
  getByName
])
