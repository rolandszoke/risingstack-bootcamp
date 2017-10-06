'use strict'

const { expect } = require('chai')
const db = require('../db')
const Contribution = require('./contribution')
const Repository = require('../repository')
const User = require('../user')
const _ = require('lodash')

describe('Contribution', () => {
  let repoId
  let repoObject
  let userObject
  let contrObject
  let userId
  beforeEach(async () => {
    // Create repository and user object
    repoId = _.random(9999)
    userId = _.random(9999)
    repoObject = {
      id: repoId,
      owner: userId,
      full_name: 'Random Repo',
      description: 'My very own and very random repository',
      html_url: 'http://randomrepo.unicorn',
      language: 'Mandarin',
      stargazers_count: _.random(9999)
    }
    userObject = {
      id: userId,
      login: 'jolan',
      avatar_url: 'http://www.randompagethatdoesntexist.rs/avatar2.jpg',
      html_url: 'https://risingstack.com/',
      type: 'User'
    }
    contrObject = {
      user: userId,
      repository: repoId,
      line_count: _.random(9999)
    }
    await User.insert(userObject)
    await Repository.insert(repoObject)
  })

  afterEach(async () => {
    await db(Repository.tableName).where({ id: repoId }).delete()
    await db(User.tableName).where({ id: userId }).delete()
  })

  describe('.insert', () => {
    // Create contribution and check the return value
    it('should insert contribution', async () => {
      const result = await Contribution.insert(contrObject)
      const contributionFromDB = await db(Contribution.tableName)
        .where({ repository: repoId, user: userId }).first()
      expect(result).to.eql(contrObject)
      expect(contributionFromDB).to.eql(contrObject)
    })
    // Check validation with wrong params
    it('should not insert unvalid contribution', async () => {
      delete contrObject.user
      try {
        await Contribution.insert(contrObject)
      } catch (err) {
        expect(err.name).to.eql('ValidationError')
        return
      }
      throw new Error('Validation did not work right')
    })
  })

  describe('.insertOrReplace', () => {
    it('should insert contribution if not exists', async () => {
      await Contribution.insertOrReplace(contrObject)
      const contributionFromDB = await db(Contribution.tableName)
        .where({ repository: repoId, user: userId }).first()
      expect(contrObject).to.eql(contributionFromDB)
    })
    it('should replace contribution if exists', async () => {
      await db(Contribution.tableName).insert(contrObject)
      contrObject.line_count = _.random(9999)
      await Contribution.insertOrReplace(contrObject)
      const contributionFromDB = await db(Contribution.tableName)
        .where({ repository: repoId, user: userId }).first()
      expect(contrObject).to.eql(contributionFromDB)
    })
  })

  describe('.read', () => {
    it('should read contribution', async () => {
      await db(Contribution.tableName).insert(contrObject)
      const expected = [{
        user: userObject,
        repository: repoObject,
        line_count: contrObject.line_count
      }]

      let result = await Contribution.read({
        repository: {
          id: contrObject.repository
        }
      })

      expect(result).to.eql(expected)

      result = await Contribution.read({
        user: {
          id: contrObject.user
        }
      })
      expect(result).to.eql(expected)
    })
  })
})
