'use strict'

const logger = require('winston')
const _ = require('lodash')
const joi = require('joi')
const redis = require('../../models/redis')

const { CHANNELS } = redis

const schema = joi.object({
  date: joi.date().raw().required(),
  query: joi.string().required()
}).required()

async function onTrigger(message) {
  logger.debug('trigger: received', message)
  // Validation
  const data = joi.attempt(message, schema)
  // Send msg ten times to repository channel
  _.range(10).map(async (page) => {
    await redis.publishObject(CHANNELS.collect.repository.v1, {
      date: data.date, query: data.query, page
    })
  })

  logger.debug('trigger: finished', message)
}

module.exports = onTrigger
