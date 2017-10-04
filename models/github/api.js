'use strict'

const request = require('request-promise-native') // request client with Promise support

const AGENT = 'RisingStack-bootcamp'
const URI = 'https://api.github.com'

function searchRepositories(query = {}) {
  return request({
    method: 'GET',
    uri: `${URI}/search/repositories`,
    headers: {
      'User-Agent': AGENT,
      Accept: 'application/vnd.github.v3+json'
    },
    qs: query, // query string
    json: true // Automatically parses the JSON string in the response
  })
}

function getContributors(repository, query = {}) {
  return request({
    method: 'GET',
    uri: `${URI}/repos/${repository}/stats/contributors`,
    headers: {
      'User-Agent': AGENT,
      Accept: 'application/vnd.github.v3+json'
    },
    qs: query, // query string
    json: true // Automatically parses the JSON string in the response
  })
}

module.exports = {
  searchRepositories,
  getContributors
}
