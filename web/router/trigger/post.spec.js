'use strict'

const request = require('super-request')
const { expect } = require('chai')
const server = require('../../server')
const redis = require('../../../models/redis')

const { CHANNELS } = redis

const url = '/api/v1/trigger'

describe(`POST ${url}`, () => {
  let now
  beforeEach(function () {
    now = Date.now()
    this.sandbox.useFakeTimers(now)
  })

  it('should response with 201 and send message', async function () {
    // Stub publishObject
    this.sandbox.stub(redis, 'publishObject').resolves()
    // Create query
    const query = 'language:javascript'
    // Make request, expect 201
    await request(server.listen())
      .post(url)
      .body({
        query
      })
      .expect(201)
      .json(true)
      .end()
    // Expect publishObject call
    expect(redis.publishObject).to.have.been.calledWith(CHANNELS.collect.trigger.v1, {
      query,
      date: new Date(now).toISOString()
    })
  })
})
