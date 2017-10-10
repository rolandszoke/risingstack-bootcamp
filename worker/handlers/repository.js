'use strict'

const logger = require('winston')
const fp = require('lodash/fp')
const _ = require('lodash')
const joi = require('joi')
const redis = require('../../models/redis')
const User = require('../../models/user')
const Repository = require('../../models/repository')
const GitHub = require('../../models/github')

const { CHANNELS } = redis

const schema = joi.object({
  date: joi.date().raw().required(),
  query: joi.string().required(),
  page: joi.number().integer().required(),
}).required()

async function onRepository(message) {
  logger.debug('repository: received', message)
  // Validation
  const data = joi.attempt(message, schema)
  // gitHub API request
  const response = await GitHub.api.searchRepositories({ q: data.query, page: data.page, per_page: 100 })
  // Modify to database model with fp
  const owners = response.items.map((e) => (
    fp.pick(['id', 'login', 'avatar_url', 'html_url', 'type'], e.user)))
  const repositories = response.items.map((e) => (
    fp.flow([
      fp.pick(['id', 'full_name', 'description', 'html_url', 'language', 'stargazers_count']),
      fp.pickBy(_.identity),
      fp.defaults({ description: '', language: '' }),
      fp.assign({ owner: e.user.id })
    ])(e)
  ))
  // Save owner to db
  fp.map(async (e) => {
    await User.insert(e)
  })(owners)
  // Save repository and push message to contributions
  fp.map(async (e) => {
    await Repository.insert(e)
    await redis.publishObject(CHANNELS.collect.contributions.v1, { date: data.date, repository: e })
  })(repositories)
  logger.debug('repository: finished', message)
}

module.exports = onRepository
