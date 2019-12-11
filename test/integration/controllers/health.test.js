/* eslint-env mocha */
import App from '../../../../dist/index'
import { expect } from 'chai'
import httpMocks from 'node-mocks-http'

const healthController = App.http.controllers.health

describe('HealthController tests', () => {
  it('Get a successful api liveness test', () => {
    const req = {}
    const res = httpMocks.createResponse()
    healthController.api(req, res)
    const responseData = JSON.parse(res._getData())
    const expected = { status: 200, message: 'success on api connect' }
    expect(responseData).to.eql(expected)
  })
})
