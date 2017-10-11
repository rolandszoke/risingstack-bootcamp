'use strict'

const { expect } = require('chai')
const _ = require('lodash')
const redis = require('../../models/redis')
const worker = require('../worker')
const gitHub = require('../../models/github')
const handlers = require('./')
const User = require('../../models/user')
const Contributions = require('../../models/contribution')

const { CHANNELS } = redis

describe('Worker "contributions" channel', () => {
  // NOTE: this one is an integration test
  // it should check whether the handler is called when a message is published to this channel, but the handler intself
  // should not be tested in this
  it(`should handle messages on the ${CHANNELS.collect.contributions.v1} channel`,
    async function () {
      // Create date and repository
      const repository = {
        id: _.random(9999),
        full_name: 'myRepoName'
      }
      const date = new Date().toISOString()
      const contributionsStub = this.sandbox.stub(handlers, 'contributions')
      const done = new Promise((resolve) => contributionsStub.callsFake(resolve))
      await worker.init()
      await redis.publishObject(CHANNELS.collect.contributions.v1, { date, repository })
      const params = await done
      expect(params).to.eql({ date, repository })
      await worker.halt()
    }
  )

  it('should fetch the contributions from GitHub & save them to the database',
    async function () {
      // Create date, repository and user
      const repository = {
        id: _.random(9999),
        full_name: 'howToDealWithInsomnia'
      }
      const date = new Date().toISOString()
      const user = {
        id: _.random(9999),
        login: 'MikulasPusztito666'
      }
      // fake fuction for gitapi
      this.sandbox.stub(gitHub.api, 'getContributors').resolves([{
        author: user,
        weeks: [
          { a: 10, d: 5 },
          { a: 5, d: 1 },
          { a: 6, d: 2 }
          // =13
        ]
      }])
      // fake function for user insert
      this.sandbox.stub(User, 'insert').resolves()
      // fake function for contribution insert
      this.sandbox.stub(Contributions, 'insertOrReplace').resolves()
      // call handler
      await handlers.contributions({ date, repository })
      // expect fake functions to be called with right parameters
      expect(gitHub.api.getContributors).to.calledWith(repository.full_name)
      expect(User.insert).to.calledWith(user)
      expect(Contributions.insertOrReplace).to.calledWith({
        line_count: 13,
        repository: repository.id,
        user: user.id
      })
    }
  )
})
