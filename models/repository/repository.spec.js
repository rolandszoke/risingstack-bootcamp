'use strict'

const { expect } = require('chai')
const db = require('../db')
const Repository = require('./repository')
const User = require('../user')
const _ = require('lodash')

describe('Repository', () => {
  let id
  let repoObject
  let userObject
  let userId

  beforeEach(async () => {
    // Create repository and user object
    id = _.random(9999)
    userId = _.random(9999)
    repoObject = {
      id,
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
    await User.insert(userObject)
  })

  afterEach(async () => {
    // Delete repository and user from table
    await db(Repository.tableName).where({ id }).delete()
    await db(User.tableName).where({ id: userId }).delete()
  })

  describe('.insert', () => {
    // Create repository and check the return value
    it('should insert repository', async () => {
      const result = await Repository.insert(repoObject)
      const repofromDB = await db(Repository.tableName).where({ id }).first()
      expect(result).to.eql(repoObject)
      expect(repofromDB).to.eql(repoObject)
    })
    // Check validation with wrong params
    it('should not insert unvalid repository', async () => {
      delete repoObject.owner
      try {
        await Repository.insert(repoObject)
      } catch (err) {
        expect(err.name).to.eql('ValidationError')
        return
      }
      throw new Error('Validation did not work right')
    })
  })

  describe('.read', () => {
    // Read repo and check the return value
    it('should read the repository', async () => {
      await db(Repository.tableName).insert(repoObject)
      const result = await Repository.read({ id: repoObject.id })
      expect(result).to.eql(Object.assign(repoObject, { owner: userObject }))
    })
    // Read with wrong params to check validation
    it('should not read unvalid search', async () => {
      await db(Repository.tableName).insert(repoObject)
      try {
        await Repository.read({ language: repoObject.language })
      } catch (err) {
        expect(err.name).to.eql('ValidationError')
        return
      }
      throw new Error('Validation did not work right')
    })
    // Read a non-existent repo and check the return value
    it('should return undefined if the repositry is non-existent', async () => {
      // Not inserting the repo
      const result = await Repository.read({ id: repoObject.id })
      expect(result).to.eql(undefined)
    })
  })
})
