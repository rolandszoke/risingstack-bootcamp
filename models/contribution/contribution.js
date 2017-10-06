'use strict'

const db = require('../db')
const joi = require('joi')
const _ = require('lodash')
const fp = require('lodash/fp')
const User = require('../user')
const Repository = require('../repository')

const tableName = 'contribution'

const insertSchema = joi.object({
  user: joi.number().integer().required(),
  repository: joi.number().integer().required(),
  line_count: joi.number().integer().default(0)
}).required()

async function insert(params) {
  // Validation with joi
  const contribution = joi.attempt(params, insertSchema)
  // Insert row
  return db(tableName).insert(contribution, '*').then(fp.first)
}

const readSchema = joi.object({
  user: joi.object({
    id: joi.number().integer(),
    login: joi.string(),
  }).xor('id', 'login'),
  repository: joi.object({
    id: joi.number().integer(),
    full_name: joi.string()
  }).xor('id', 'full_name')
}).or('user', 'repository').required()

async function read(params) {
  // Validation with joi
  const search = joi.attempt(params, readSchema)
  // Filter undefined
  const filteredSearch = _.pickBy(search, _.identity)
  const condition = {}
  _.each(filteredSearch, (tvalue, tkey) => {
    _.each(tvalue, (value, key) => {
      condition[tkey.concat('.'.concat(key))] = value
    })
  })
  // Get contribution
  const contribution = await db(tableName)
    .select([
      `${tableName}.*`,
      db.raw(`to_json("${User.tableName}".*) as "user"`),
      db.raw(`to_json(${Repository.tableName}.*) as repository`)
    ])
    .where(condition)
    .leftJoin(User.tableName, `${tableName}.user`, `${User.tableName}.id`)
    .leftJoin(Repository.tableName, `${tableName}.repository`, `${Repository.tableName}.id`)
  if (contribution === undefined) {
    return undefined
  }
  return contribution
}

async function insertOrReplace(params) {
  const contribution = joi.attempt(params, insertSchema)
  const query = `INSERT INTO :tableName: ("user", repository, line_count)
    VALUES (:user, :repository, :line_count)
    ON CONFLICT ("user", repository) DO UPDATE SET line_count = :line_count
    RETURNING *;`
  return db.raw(query, Object.assign({ tableName }, contribution))
    .then(fp.first)
}

module.exports = {
  tableName,
  insert,
  insertOrReplace,
  read
}
