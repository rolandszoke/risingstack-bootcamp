'use strict'

const db = require('../db')
const joi = require('joi')
const fp = require('lodash/fp')

const tableName = 'user'

const insertSchema = joi.object({
  id: joi.number().integer().required(),
  login: joi.string().required(),
  avatar_url: joi.string().uri().required(),
  html_url: joi.string().uri().required(),
  type: joi.string().required()
}).required()

async function insert(params) {
  // Validation with joi
  const user = joi.attempt(params, insertSchema)
  // Insert row
  return db(tableName).insert(user, '*').then(fp.first)
}

const readSchema = joi.object({
  id: joi.number().integer(),
  login: joi.string()
}).xor('id', 'login').required()

async function read(params) {
  const selection = joi.attempt(params, readSchema)
  return db(tableName).where(selection).first()
}

module.exports = {
  tableName,
  insert,
  read
}
