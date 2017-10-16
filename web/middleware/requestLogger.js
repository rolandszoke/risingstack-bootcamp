'use strict'

const logger = require('winston')
const _ = require('lodash')

function makeRequestLogger(options = {}) {
  let { level = 'silly' } = options
  return async function requestLogger(ctx, next) {
    // Request start
    const beginAt = Date.now()
    // Method, url, headers and body of the request
    const { method, originalUrl, headers: requestHeaders, body: requestBody } = ctx.request
    try {
      await next()
    } catch (err) {
      logger.error(`${method}: ${originalUrl}`, { error: err.message })
      throw err
    }
    // Request duration
    const reqDuration = new Date() - beginAt
    // Response headers
    const { status, headers: responseHeaders, body: responseBody = '' } = ctx.response
    // Response status code
    if (ctx.status >= 500) level = 'error'
    else if (ctx.status >= 400) level = 'warn'
    // Logging
    logger.log(level, `${method}: ${originalUrl}`, {
      method,
      originalUrl,
      request: _.omitBy({
        headers: _.omit(requestHeaders, ['authorization', 'cookie']),
        body: requestBody
      }, _.isNil),
      duration: `${reqDuration}ms`,
      response: _.omitBy({
        status,
        headers: _.omit(responseHeaders, ['authorization', 'cookie']),
        body: responseBody
      }, _.isNil)
    })
  }
}

module.exports = makeRequestLogger
