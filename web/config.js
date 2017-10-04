'use strict'

const joi = require('joi') // object schema description language for Js objects

const envVarsSchema = // schema definition
  joi.object({
    PORT: joi.number().integer().min(0).max(65535)
      .required()
  }).unknown().required()

const envVars = joi.attempt(process.env, envVarsSchema) // validate process.env against envVarsSchema

const config = {
  port: envVars.PORT // get the PORT
}

module.exports = config
