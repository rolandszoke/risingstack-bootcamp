'use strict'

const { expect } = require('chai')
const redis = require('./redis')

describe('Redis health check', () => {
  it('should not throw error', async () => {
    let error = false
    try {
      await redis.healthCheck()
    } catch (err) {
      error = true
    }
    expect(error).to.be.false
  })
  it('should throw error if the redis is disconnected', async () => {
    await redis.destroy()
    let error = false
    try {
      await redis.healthCheck()
    } catch (err) {
      error = true
    }
    expect(error).to.be.true
  })
})
