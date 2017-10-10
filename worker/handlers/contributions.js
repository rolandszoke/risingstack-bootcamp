'use strict'

const logger = require('winston')
const fp = require('lodash/fp')
const joi = require('joi')
const User = require('../../models/user')
const Contribution = require('../../models/contribution')
const GitHub = require('../../models/github')

const schema = joi.object({
  date: joi.date().raw().required(),
  repository: joi.object({
    id: joi.number().integer().required(),
    full_name: joi.string().required()
  }).required().unknown()
}).required()

async function onContributions(message) {
  logger.debug('contributions: received', message)
  // Validation
  const data = joi.attempt(message, schema)
  // gitHub API request
  const contributors = await GitHub.api.getContributors(data.repository.full_name)
  // map to counted line per user with pick(lodash) and reduce
  const countedLines = contributors.map(({ author, weeks }) => ({
    user: fp.pick(['id', 'login', 'avatar_url', 'html_url', 'type'], author),
    line_count: weeks.reduce((lines, { a, d }) => lines + (a - d), 0)
  }))
  // Save user and contribution
  fp.map(async (e) => {
    await User.insert(e.user)
    await Contribution.insertOrReplace({
      repository: data.repository.id,
      user: e.user.id,
      line_count: e.line_count
    })
  })(countedLines)
  logger.debug('contributions: finished', message)
}

module.exports = onContributions
