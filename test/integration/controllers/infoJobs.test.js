/* eslint-env mocha */

import { expect } from 'chai'
import httpMocks from 'node-mocks-http'
import { EventEmitter } from 'events'
import App from '../../../../dist/index'

const infoJobsController = App.http.controllers.infoJobs
const Utils = App.http.utils

let PRELOAD = {}

async function Preload () {
  const infoJob = {
    createdBy: 'TEST',
    idReference: 'TEST',
    propertyReference: 'campaignId',
    entityReference: 'Card',
    dateStart: new Date(),
    operation: 'DELETE',
    status: 'RUNNING'
  }

  PRELOAD.status = infoJob.status
  await Utils.infoJobs.create(infoJob).catch(console.error)
}

Preload().then(
  describe('InfoJobs tests', () => {
    describe('Check Controller Tests', () => {
      it('Get status of a Job successfully', (done) => {
        const finalResponse = {status: {message: PRELOAD.status, success: true}}
        const req = httpMocks.createRequest({
          method: 'GET',
          params: {
            id: 'TEST'
          },
          headers: {
            userid: 'TEST',
            country: 'BR',
            clientid: 'TESTS'
          }
        })
        const res = httpMocks.createResponse({
          eventEmitter: EventEmitter
        })
        const resultPromise = new Promise((resolve) => {
          res.on('end', () => {
            const data = JSON.parse(res._getData())
            resolve(data)
            res.end()
          })
        })
        resultPromise
          .then(data => {
            expect(data).to.eql(finalResponse)
            done()
          })
          .catch(err => done(err))
        infoJobsController.checkStatusJob(req, res)
      })
      it('Get a error trying get a infoJob without userId', (done) => {
        const req = httpMocks.createRequest({
          method: 'GET'
        })
        const res = httpMocks.createResponse({
          eventEmitter: EventEmitter
        })
        const resultPromise = new Promise((resolve) => {
          res.on('end', () => {
            const data = JSON.parse(res._getData())
            resolve(data)
            res.end()
          })
        })
        resultPromise
          .then(data => {
            expect(data.status.success).to.be.equal(false)
            done()
          })
          .catch(err => done(err))
        infoJobsController.checkStatusJob(req, res)
      })
    })
  })
)
