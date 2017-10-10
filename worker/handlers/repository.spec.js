'use strict'

const { expect } = require('chai')
const _ = require('lodash')
const redis = require('../../models/redis')
const worker = require('../worker')
const gitHub = require('../../models/github')
const handlers = require('./')
const User = require('../../models/user')
const Repository = require('../../models/repository')

const { CHANNELS } = redis

describe('Worker "repository" channel', () => {
  // NOTE: this one is an integration test
  // it should check whether the handler is called when a message is published to this channel, but the handler intself
  // should not be tested in this
  it(`should handle messages on the ${CHANNELS.collect.repository.v1} channel`,
    async function () {
      // create data
      const date = new Date().toISOString()
      const query = 'language:javascript'
      const page = _.random(100)
      // fake handler
      const done = new Promise((resolve, reject) => {
        this.sandbox.stub(handlers, 'repository').callsFake(async (params) => {
          await worker.halt()
          try {
            expect(params).to.eql({ date, query, page })
          } catch (err) {
            reject(err)
            return
          }
          resolve()
        })
      })
      await worker.init()
      await redis.publishObject(CHANNELS.collect.repository.v1, {
        date,
        page,
        query
      })
      return done
    }
  )

  it(`should fetch repositories from GitHub & send the messages to the ${CHANNELS.collect.contributions.v1} channel`,
    async function () {
      // Create repository, user and request data
      const repository = {
        id: _.random(9999),
        full_name: '@risingstack/foo',
        description: 'Very foo package, using bar technologies',
        html_url: 'https://github.com/risingstack/foo',
        language: 'Baz',
        stargazers_count: _.random(1000)
      }
      const user = {
        id: _.random(9999),
        login: 'developer',
        avatar_url: 'https://developer.com/avatar.png',
        html_url: 'https://github.com/developer',
        type: 'User'
      }
      const date = new Date().toISOString()
      const query = 'language:javascript'
      const page = 0
      // fake fuction for gitapi
      this.sandbox.stub(gitHub.api, 'searchRepositories').resolves({ items: [Object.assign({ user }, repository)] })
      // fake function for user insert
      this.sandbox.stub(User, 'insert').resolves()
      // fake function for repository insert
      this.sandbox.stub(Repository, 'insert').resolves()
      // fake publish function
      this.sandbox.stub(redis, 'publishObject').resolves()
      // call handler
      await handlers.repository({ date, query, page })
      // expect fake functions to be called with right parameters
      expect(gitHub.api.searchRepositories).to.calledWith({ q: query, page, per_page: 100 })
      expect(User.insert).to.calledWith(user)
      expect(Repository.insert).to.calledWith(Object.assign({ owner: user.id }, repository))
      expect(redis.publishObject).to.calledWith(CHANNELS.collect.contributions.v1, {
        date,
        repository: Object.assign({ owner: user.id }, repository)
      })
    }
  )
})
