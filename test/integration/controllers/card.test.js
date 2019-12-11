/* eslint-env mocha */

import { expect } from 'chai'
import httpMocks from 'node-mocks-http'
import { EventEmitter } from 'events'
import faker from 'faker'
import App from '../../../../dist/index'

const cardController = App.http.controllers.card
let PRELOADS = {}

const getCardsResponseModel = (cards = [], moreResults = false, nextPage = '') => ({
  cards,
  moreResults,
  nextPage
})

function CardPayload () {
  return {
    template: '',
    dateEnd: '',
    campaignId: '',
    campaignGroup: '',
    menu: '',
    userId: '',
    metadata: [
      {
        type: 'HEADER',
        home: true,
        title: '',
        icon: '',
        actions: []
      }
    ],
    createdBy: '',
    tags: [
      '',
      ''
    ],
    description: '',
    dateStart: '',
    priority: 1,
    createId: '',
    clientId: ''
  }
}

const generateResponseCreateCards = (withSuccess, withErrors = []) => {
  const response = {success: [], errors: []}
  const successModel = () => ({id: ''})
  const errorModel = card => ({
    insert: false,
    message: 'invalid fields',
    detail: {
      priority: [
        'The priority field is required.'
      ]
    },
    card
  })

  let res = {}
  let i = 1
  while (withSuccess--) {
    res = successModel()
    res.id = `${i}`
    response.success.push(res)
    i++
  }
  i = 0
  res = {}
  while (i < withErrors.length) {
    res = errorModel(withErrors[i])
    response.errors.push(res)
    i++
  }
  return response
}

const generateCards = (withSuccess, withErrors = 0, defaults = {}) => {
  const cards = {success: [], errors: []}
  let card = {}
  while (withSuccess--) {
    card = new CardPayload()
    card.campaignGroup = defaults.campaignGroup || faker.random.uuid()
    card.campaignId = defaults.campaignId || faker.random.uuid()
    card.clientId = defaults.clientId || faker.random.uuid()
    card.createId = defaults.createId || `${faker.random.number()}`
    card.createdBy = defaults.createdBy || `${faker.random.number()}`
    card.dateEnd = defaults.dateEnd || new Date(`${faker.date.future()}`)
    card.dateStart = defaults.dateStart || new Date(`${faker.date.past()}`)
    card.description = defaults.description || faker.random.word()
    card.menu = defaults.menu || faker.random.word()
    card.metadata[0].actions = (defaults.metadata && defaults.metadata[0].actions) || faker.random.words
    card.metadata[0].title = (defaults.metadata && defaults.metadata[0].title) || faker.random.words
    card.metadata[0].icon = (defaults.metadata && defaults.metadata[0].icon) || 'https://s3.amazonaws.com/uifaces/faces/twitter/ciaranr/128.jpg'
    card.priority = defaults.priority || faker.random.number({min: 1, max: 5})
    card.template = defaults.template || `${faker.random.number()}`
    card.userId = defaults.userId || faker.random.alphaNumeric(12)
    cards.success.push(card)
  }
  while (withErrors--) {
    card = new CardPayload()
    card.campaignGroup = faker.random.uuid()
    card.campaignId = faker.random.uuid()
    card.clientId = faker.random.uuid()
    card.createId = `${faker.random.number()}`
    card.createdBy = `${faker.random.number()}`
    card.dateEnd = `${faker.date.future()}`
    card.dateStart = `${faker.date.past()}`
    card.description = faker.random.word()
    card.menu = faker.random.word()
    card.metadata[0].actions = faker.random.words()
    card.metadata[0].title = faker.random.words()
    card.metadata[0].icon = 'https://s3.amazonaws.com/uifaces/faces/twitter/ciaranr/128.jpg'
    card.template = `${faker.random.number()}`
    card.userId = faker.random.alphaNumeric(12)
    delete card.priority
    cards.errors.push(card)
  }
  return cards
}

async function Preload () {
  let bulk = []
  PRELOADS.getByUserId = generateCards(10, 0, {clientId: 'TESTS', userId: 'TEST', menu: '0'}).success
  bulk = bulk.concat(PRELOADS.getByUserId)
  PRELOADS.menu = generateCards(10, 0, {userId: 'TEST', menu: 'TESTS'}).success
  const req = httpMocks.createRequest({
    method: 'POST',
    headers: {
      userid: '123'
    },
    body: {
      cards: bulk
    }
  })
  const res = httpMocks.createResponse({
    eventEmitter: EventEmitter
  })
  await cardController.create(req, res)
    .catch(err => { console.error(JSON.stringify(err)) })
}

Preload().then(
  describe('CardController tests', () => {
    describe('Create Controller Tests', () => {
      it('create cards successfuly', (done) => {
        const generatedCards = generateCards(10)
        const bulk = generatedCards.success
        const req = httpMocks.createRequest({
          method: 'POST',
          headers: {
            userid: '123'
          },
          body: {
            cards: bulk
          }
        })
        const res = httpMocks.createResponse({
          eventEmitter: EventEmitter
        })

        cardController.create(req, res)
        const resultPromise = new Promise((resolve, reject) => {
          res.on('end', () => {
            const data = JSON.parse(res._getData())
            resolve(data)
          })
          res.on('error', (err) => {
            reject(err)
          })
        })
        resultPromise
          .then(data => {
            expect(data.status.success).to.equal(true)
            done()
          })
          .catch(err => { done(err) })
      })
      it('Error on create cards by fail on validation', (done) => {
        const bulk = generateCards(0, 2).errors
        const finalResponse = {
          status: {
            success: false,
            message: 'Operation failed',
            details: generateResponseCreateCards(0, bulk)
          }
        }

        const req = httpMocks.createRequest({
          method: 'POST',
          headers: {
            userid: '123'
          },
          body: {
            cards: bulk
          }
        })

        const res = httpMocks.createResponse({
          eventEmitter: EventEmitter
        })

        cardController.create(req, res)
        const resultPromise = new Promise((resolve) => {
          res.on('end', () => {
            const data = JSON.parse(res._getData())
            resolve(data)
          })
        })
        resultPromise
          .then(data => {
            expect(data.status.details.errors).to.have.not.ordered.members(finalResponse.status.details.errors)
            done()
          })
          .catch(err => done(err))
      })
      it('call create controller with request body empty', (done) => {
        const req = httpMocks.createRequest({
          headers: {
            userid: 'UNIT_TEST'
          },
          method: 'POST',
          body: {
            cards: []
          }
        })
        const res = httpMocks.createResponse({
          eventEmitter: EventEmitter
        })
        const finalResponse = {
          status: {
            message: 'Operation failed',
            success: false,
            details: {
              success: [],
              errors: [{ message: 'Empty Content' }]
            }
          }
        }
        cardController.create(req, res)
        const resultPromise = Promise.resolve(res._getData())
        resultPromise
          .then(data => {
            data = JSON.parse(data)
            expect(data).to.eql(finalResponse)
            done()
          })
          .catch(err => {
            done(err)
          })
      })
    })

    describe('GetByUserId Controller Tests', () => {
      it('Get cards correctly', (done) => {
        const finalResponse = Object.assign({}, {response: getCardsResponseModel(PRELOADS.getByUserId), status: {message: ``, success: true}})
        const req = httpMocks.createRequest({
          method: 'GET',
          params: {
            limit: '20',
            page: '0'
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
        cardController.getByUserId(req, res)
        const resultPromise = new Promise((resolve) => {
          res.on('end', () => {
            const data = JSON.parse(res._getData())
            resolve(data)
            res.end()
          })
        })
        resultPromise
          .then(data => {
            expect(data.response.cards.length).to.be.equal(finalResponse.response.cards.length)
            done()
          })
          .catch(err => done(err))
      })
      it('Get a error trying get a card without userId', (done) => {
        const req = httpMocks.createRequest({
          method: 'GET',
          params: {
            limit: '20',
            page: '0'
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
            expect(data.status.success).to.be.equal(false)
            done()
          })
          .catch(err => done(err))
        cardController.getByUserId(req, res)
      })
    })

    describe('GetMenus Controller Tests', () => {
      it('Get menus correctly', (done) => {
        const finalResponse = Object.assign({}, {response: {menus: ['TESTS']}, status: {message: ``, success: true}})
        const req = httpMocks.createRequest({
          method: 'GET',
          query: {
            limit: '20',
            page: '0'
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
        cardController.getMenus(req, res)
        const resultPromise = new Promise((resolve) => {
          res.on('end', () => {
            const data = JSON.parse(res._getData())
            resolve(data)
            res.end()
          })
        })
        resultPromise
          .then(data => {
            expect(data.response.menus.length).to.be.equal(finalResponse.response.menus.length)
            done()
          })
          .catch(err => done(err))
      })
      it('Get a error trying get menus without userId', (done) => {
        const req = httpMocks.createRequest({
          method: 'GET',
          query: {
            limit: '20',
            page: '0'
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
            expect(data.status.success).to.be.equal(false)
            done()
          })
          .catch(err => done(err))
        cardController.getMenus(req, res)
      })
    })

    describe('Dimiss Controller Tests', () => {
      it('Dismiss a card succesfully', (done) => {
        const finalResponse = { status: { message: 'Operation success', success: true } }
        const req = httpMocks.createRequest({
          method: 'PUT',
          headers: {
            userid: 'TEST',
            country: 'BR',
            clientid: 'TESTS'
          },
          params: {
            id: '2'
          }
        })
        const res = httpMocks.createResponse({
          eventEmitter: EventEmitter
        })
        cardController.dismiss(req, res)
        const resultPromise = new Promise((resolve) => {
          res.on('end', () => {
            const data = JSON.parse(res._getData())
            resolve(data)
          })
        })
        resultPromise
          .then(data => {
            expect(data).to.eql(finalResponse)
            done()
          })
          .catch(err => done(err))
      })
      it('Get a error trying dismiss a not found card', (done) => {
        const finalResponse = { status: { message: 'Card not found', success: false } }
        const req = httpMocks.createRequest({
          method: 'PUT',
          headers: {
            userid: 'TEST',
            country: 'BR',
            clientid: 'TESTS'
          },
          params: {
            id: '10000000'
          }
        })
        const res = httpMocks.createResponse({
          eventEmitter: EventEmitter
        })
        cardController.dismiss(req, res)
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
      })
    })

    describe('Snooze Controller Tests', () => {
      it('Snooze a card succesfully', (done) => {
        const finalResponse = { status: { message: 'Operation success', success: true } }
        const req = httpMocks.createRequest({
          method: 'PUT',
          headers: {
            userid: 'TEST',
            country: 'BR',
            clientid: 'TESTS'
          },
          params: {
            id: '7'
          }
        })
        const res = httpMocks.createResponse({
          eventEmitter: EventEmitter
        })
        cardController.snooze(req, res)
        const resultPromise = new Promise((resolve) => {
          res.on('end', () => {
            const data = JSON.parse(res._getData())
            resolve(data)
          })
        })
        resultPromise
          .then(data => {
            expect(data).to.eql(finalResponse)
            done()
          })
          .catch(err => done(err))
      })
      it('Get a error trying snooze a not found card', (done) => {
        const finalResponse = { status: { message: 'Card not found', success: false } }
        const req = httpMocks.createRequest({
          method: 'PUT',
          headers: {
            userid: 'TEST',
            country: 'BR',
            clientid: 'TESTS'
          },
          params: {
            id: '10000000'
          }
        })
        const res = httpMocks.createResponse({
          eventEmitter: EventEmitter
        })
        cardController.snooze(req, res)
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
      })
    })
  })
)
