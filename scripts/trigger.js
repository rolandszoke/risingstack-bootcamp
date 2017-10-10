'use strict'

const joi = require('joi')
const redis = require('../models/redis')

const { CHANNELS } = redis

const envVarsSchema = joi.object({
  TRIGGER_QUERY: joi.string().required()
}).unknown()
  .required()

const envVars = joi.attempt(process.env, envVarsSchema)

const args = process.argv.slice(2)
if (args.includes('--local') || args.includes('-L')) {
  process.env.REDIS_URI = 'redis://localhost'
}

redis.publishObject(CHANNELS.collect.trigger.v1, {
  date: new Date().toISOString(), query: envVars.TRIGGER_QUERY
})
  .then(() => {
    // eslint-disable-next-line no-console
    console.log('Message published to trigger channel!')
    process.exit(0)
  })
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error(err)
    process.exit(1)
  })

