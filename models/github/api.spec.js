'use strict'

// Nock is an HTTP mocking and expectations library for Node.js
const nock = require('nock')
const { expect } = require('chai')
const api = require('./api')

const AGENT = 'RisingStack-bootcamp'
const URI = 'https://api.github.com'

describe('GitHub API', () => {
  it('should search repositories', async () => {
    const response = { items: [] }
    const gitHubAPI = nock(URI, {
      reqheaders: {
        'User-Agent': AGENT,
        Accept: 'application/vnd.github.v3+json'
      }
    })
      .get('/search/repositories')
      .query({ q: 'language:javascript' })
      .reply(200, response)
    const result = await api.searchRepositories({ q: 'language:javascript' })
    expect(gitHubAPI.isDone()).to.eql(true)
    expect(result).to.eql(response)
  })
  it('should get contributors', async () => {
    const response = [{ author: {}, weeks: [] }]
    const gitHubAPI = nock(URI, {
      reqheaders: {
        'User-Agent': AGENT,
        Accept: 'application/vnd.github.v3+json'
      }
    })
      .get('/repos/owner/repository/stats/contributors')
      .reply(200, response)
    const result = await api.getContributors('owner/repository')
    expect(gitHubAPI.isDone()).to.eql(true)
    expect(result).to.eql(response)
  })
})
