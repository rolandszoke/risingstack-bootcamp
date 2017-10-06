'use strict'

const { expect } = require('chai')
const db = require('../db')
const User = require('./user')
const _ = require('lodash')

describe('User', () => {
  let id
  let userObject

  beforeEach(async () => {
    // Create user object
    id = _.random(9999)
    userObject = {
      id,
      login: 'bela',
      avatar_url: 'http://www.randompagethatdoesntexist.rs/avatar.jpg',
      html_url: 'https://risingstack.com/',
      type: 'User'
    }
  })

  afterEach(async () => {
    // Delete user from table
    await db(User.tableName).where({ id }).delete()
  })

  describe('.insert', () => {
    // Create user and check the return value
    it('should insert user', async () => {
      const result = await User.insert(userObject)
      const userfromDB = await db(User.tableName).where({ id }).first()
      expect(result).to.eql(userObject)
      expect(userfromDB).to.eql(userObject)
    })
    // Check validation with wrong params
    it('should not insert unvalid user', async () => {
      delete userObject.type
      try {
        await User.insert(userObject)
      } catch (err) {
        expect(err.name).to.eql('ValidationError')
        return
      }
      throw new Error('Validation did not work right')
    })
  })

  describe('.read', () => {
    // Read user and check the return value
    it('should read the user', async () => {
      await db(User.tableName).insert(userObject)
      const result = await User.read({ id: userObject.id })
      expect(result).to.eql(userObject)
    })
    // Read with wrong params to check validation
    it('should not read unvalid search', async () => {
      await db(User.tableName).insert(userObject)
      try {
        await User.read({ type: userObject.type })
      } catch (err) {
        expect(err.name).to.eql('ValidationError')
        return
      }
      throw new Error('Validation did not work right')
    })
    // Read a non-existent user and check the return value
    it('should return undefined if the user is non-existent', async () => {
      const result = await User.read({ id: userObject.id })
      expect(result).to.eql(undefined)
    })
  })
})
