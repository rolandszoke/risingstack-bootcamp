'use strict'

const request = require('super-request')
const { expect } = require('chai')
const server = require('../../server')
const db = require('../../../models/db')
const redis = require('../../../models/redis')

const url = '/healthz'
describe(`GET ${url}`, () => {
  it('should return status ok', async function () {
    // stub healthCheck function
    this.sandbox.stub(db, 'healthCheck').resolves()
    this.sandbox.stub(redis, 'healthCheck').resolves()
    // send request
    const { body } = await request(server.listen())
      .get(url)
      .expect(200)
      .json(true)
      .end()
    // expect body
    expect(body).to.eql({ status: 'ok' })
    // expect healthCheck functions called
    expect(db.healthCheck).to.have.been.calledOnce
    expect(redis.healthCheck).to.have.been.calledOnce
  })

  it('should return 500 if db is not healthy', async function () {
    // stub healthCheck function
    this.sandbox.stub(db, 'healthCheck').rejects(new Error())
    this.sandbox.stub(redis, 'healthCheck').resolves()
    // send request
    await request(server.listen())
      .get(url)
      .expect(500)
      .json(true)
      .end()
    // expect healthCheck functions called
    expect(db.healthCheck).to.have.been.calledOnce
  })

  it('should return 500 if redis is not healthy', async function () {
    // stub healthCheck function
    this.sandbox.stub(db, 'healthCheck').resolves()
    this.sandbox.stub(redis, 'healthCheck').rejects(new Error())
    // send request
    await request(server.listen())
      .get(url)
      .expect(500)
      .json(true)
      .end()
    // expect healthCheck functions called
    expect(redis.healthCheck).to.have.been.calledOnce
  })

  it('should return 503 if SIGTERM was sent to process', async function () {
    // stub healthCheck function
    this.sandbox.stub(db, 'healthCheck').resolves()
    this.sandbox.stub(redis, 'healthCheck').resolves()
    // send signal
    process.emit('SIGTERM')
    // send request
    await request(server.listen())
      .get(url)
      .expect(503)
      .json(true)
      .end()
    // expect healthCheck functions called
    expect(redis.healthCheck).not.to.have.been.called
    expect(db.healthCheck).not.to.have.been.called
  })
})
