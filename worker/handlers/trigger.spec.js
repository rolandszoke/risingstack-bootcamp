'use strict'

const { expect } = require('chai')
const redis = require('../../models/redis')
const worker = require('../worker')
const handlers = require('./')
const _ = require('lodash')

const { CHANNELS } = redis

describe('Worker "trigger" channel', () => {
  // NOTE: this one is an integration test
  // it should check whether the handler is called when a message is published to this channel, but the handler intself
  // should not be tested in this
  it(`should handle messages on the ${CHANNELS.collect.trigger.v1} channel`,
    async function () {
      // create data
      const date = new Date().toISOString()
      const query = 'language:javascript'
      // fake handler
      const done = new Promise((resolve, reject) => {
        this.sandbox.stub(handlers, 'trigger').callsFake(async (params) => {
          await worker.halt()
          try {
            expect(params).to.eql({ date, query })
          } catch (err) {
            reject(err)
            return
          }
          resolve()
        })
      })
      await worker.init()
      await redis.publishObject(CHANNELS.collect.trigger.v1, { date, query })
      return done
    }
  )

  it(`should send the messages to the ${CHANNELS.collect.repository.v1} channel`,
    async function () {
      // request data
      const date = new Date().toISOString()
      const query = 'language:javascript'
      // fake publish function
      this.sandbox.stub(redis, 'publishObject').resolves()
      // call handler
      await handlers.trigger({ date, query })
      // expect fake functions to be called with right parameters
      expect(redis.publishObject).to.callCount(10)
      _.range(10).forEach((page) => {
        expect(redis.publishObject).to.calledWith(CHANNELS.collect.repository.v1, { date, query, page })
      })
    }
  )
})
