'use strict'

const db = require('../db')
const joi = require('joi')
const _ = require('lodash')
const fp = require('lodash/fp')
const User = require('../user')

const tableName = 'repository'

const insertSchema = joi.object({
  id: joi.number().integer().required(),
  owner: joi.number().integer().required(),
  full_name: joi.string().required(),
  description: joi.string().required().allow(''),
  html_url: joi.string().uri().required(),
  language: joi.string().required().allow(''),
  stargazers_count: joi.number().integer().required()
}).required()

async function insert(params) {
  // Validation with joi
  const repository = joi.attempt(params, insertSchema)
  // Insert row
  return db(tableName).insert(repository, '*').then(fp.first)
}

const readSchema = joi.object({
  id: joi.number().integer(),
  full_name: joi.string()
}).xor('id', 'full_name').required()

async function read(params) {
  // Validation with joi
  const search = joi.attempt(params, readSchema)
  // Filter undefined
  const filteredSearch = _.pickBy(search, _.identity)
  const condition = {}
  _.each(filteredSearch, (value, key) => {
    condition[tableName.concat('.'.concat(key))] = value
  })
  // Get repository
  const repository = await db(tableName)
    .select([
      `${tableName}.*`,
      db.raw(`to_json("${User.tableName}".*) as "owner"`)
    ])
    .where(condition)
    .leftJoin(User.tableName, `${tableName}.owner`, `${User.tableName}.id`)
    .first()
  if (repository === undefined) {
    return undefined
  }
  return repository
}

module.exports = {
  tableName,
  insert,
  read
}
