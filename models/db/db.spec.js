'use strict'

const { expect } = require('chai')
const db = require('./db')

describe('DB health check', () => {
  it('should not throw error', async () => {
    let error = false
    try {
      await db.healthCheck()
    } catch (err) {
      error = true
    }
    expect(error).to.be.false
  })
})
