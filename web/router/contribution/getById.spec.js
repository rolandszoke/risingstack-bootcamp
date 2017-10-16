'use strict'

const request = require('super-request')
const { expect } = require('chai')
const server = require('../../server')
const contribution = require('../../../models/contribution')
const _ = require('lodash')

const url = '/api/v1/repository/:id/contributions'

describe(`GET ${url}`, () => {
  it('should response with 200 if the contribution exists ', async function () {
    // Create id
    const id = _.random(999)
    // Stub read from repo with id resolve
    this.sandbox.stub(contribution, 'read').resolves({ id })
    // Make request, expect 200
    const { body } = await request(server.listen())
      .get(`/api/v1/repository/${id}/contributions`)
      .expect(200)
      .json(true)
      .end()
    // Expect same id and read call
    expect(contribution.read).to.have.been.calledWith({ id })
    expect(body).to.eql({ id })
  })
  it('should response with 404 if the contribution does not exist', async function () {
    // Create id
    const id = _.random(999)
    // Stub read from repo with undefined resolve
    this.sandbox.stub(contribution, 'read').resolves(undefined)
    // Make request, expect 404
    await request(server.listen())
      .get(`/api/v1/repository/${id}/contributions`)
      .expect(404)
      .json(true)
      .end()
    // Expect read call
    expect(contribution.read).to.have.been.calledWith({ id })
  })
})
