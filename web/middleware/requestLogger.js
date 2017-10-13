'use strict'

const logger = require('winston')
const _ = require('lodash')

function makeRequestLogger() {
  return async function requestLogger(ctx, next) {
    // Method and url of the request

    // Request headers and body

    // Request duration

    // Response headers

    // Response status code

    await next()
  }
}

module.exports = makeRequestLogger
