'use strict'

const joi = require('joi')
const compose = require('koa-compose')
const middleware = require('../../middleware')
const contribution = require('../../../models/contribution')

const schema = joi.object({
  owner: joi.string().required(),
  name: joi.string().required()
}).required()

async function getByName(ctx) {
  const fullName = `${ctx.params.owner}/${ctx.params.name}`
  const result = await contribution.read({ full_name: fullName })
  if (!result) ctx.status = 404
  else ctx.body = result
}

module.exports = compose([
  middleware.validator({ params: schema }),
  getByName
])
