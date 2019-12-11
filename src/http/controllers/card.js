import uuid from 'uuid/v1'
module.exports = app => {
  const CardRepository = app.infrastructure.repositories.card
  const InfoJobsRepository = app.infrastructure.repositories.infoJobs
  const validate = app.infrastructure.repositories.utils.validator.validate
  const cardType = app.infrastructure.repositories.utils.validationTypes.card
  const Utils = app.http.utils
  class CardController {
    /**
     * Catch a array of cards in request and send to create repository
     * @param {Object} req
     * @param {Object} res
     */
    static async create (req, res) {
      const userId = req.headers.userid
      let bulk = req.body.cards
      if (!userId) {
        const message = {status: {message: 'Operation failed', success: false, details: { success: [], errors: [{ message: `You aren't logged` }] }}}
        res.status(412).json(message)
        return
      }
      if (!bulk || bulk.length < 1) {
        const message = {status: {message: 'Operation failed', success: false, details: { success: [], errors: [{ message: 'Empty Content' }] }}}
        res.status(412).json(message)
        return
      }
      bulk = await Utils.cards.eraseDuplicatedsFromDB(bulk, CardRepository)
      let finalResponse = {status: {message: '', success: '', details: {success: [], errors: []}}}
      const {validatedBulk, failedCards} = validate(bulk, cardType)
      if (validatedBulk.length) {
        CardRepository.create(validatedBulk)
          .then(data => data.concat({errors: failedCards}))
          .then(data => {
            if (data[1]) {
              finalResponse.status.details = {success: [], errors: data[1].errors}
            } else {
              finalResponse.status.details = {success: [], errors: data}
            }
            if (data[0].mutationResults) {
              for (let result of data[0].mutationResults) {
                finalResponse.status.details.success = finalResponse.status.details.success.concat({id: result.key.path[0].id})
              }
            }
            if (!finalResponse.status.details.errors.length) {
              finalResponse.status = Object.assign({}, finalResponse.status, Utils.cards.appendResponseMessage(true, 'Operation Success'))
              res.status(200).json(finalResponse)
            } else {
              finalResponse.status = Object.assign({}, finalResponse.status, Utils.cards.appendResponseMessage(true, 'Operation Success with observations'))
              res.status(202).json(finalResponse)
            }
          })
          .catch(err => {
            console.log(err)
            finalResponse.status = Utils.cards.appendResponseMessage(false, 'Operation failed')
            finalResponse.status.details.errors = err[0] ? err[0].errors : err
            res.status(412).json(finalResponse)
          })
      } else {
        finalResponse.status.details.errors = failedCards
        finalResponse.status = Object.assign({}, finalResponse.status, Utils.cards.appendResponseMessage(false, 'Operation failed'))
        res.status(412).json(finalResponse)
      }
    }

    /**
     * Verify if has a user doing the operation and sends the user Id and Card id
     * to update repository
     * @param {Object} req
     * @param {Object} res
     */
    static async dismiss (req, res) {
      const { id } = req.params
      const userId = req.headers.userid && req.headers.userid
      const filters = [{active: true, deletedAt: '', userId: userId}]
      if (!userId) {
        const message = { success: [], errors: [{ message: `You aren't logged` }] }
        res.status(412).json(message)
        return
      }
      const updatedValue = {active: false, dismissedAt: new Date()}
      let response = await Utils.cards.fetchCards(id, '__key__', filters)
      let cards = response.cards
      cards = Utils.cards.updateCards(updatedValue, cards)
      if (cards.length) {
        CardRepository.update(cards[0])
          .then(() => res.status(200).json(Object.assign({}, {status: { message: `Operation success`, success: true }})))
          .catch(err => {
            console.error(JSON.stringify(err))
            const {message, success} = err
            res.status(500).json({status: {message, success}})
          })
      } else {
        const response = {status: {message: `Card not found`, success: false}}
        res.status(404).json(response)
      }
    }

    /**
     * Verify if has a user doing the operation and sends the user Id and Card id
     * to snooze repository
     * @param {Object} req
     * @param {Object} res
     */
    static async snooze (req, res) {
      const { id } = req.params
      const userId = req.headers.userid && req.headers.userid
      const filters = [{active: true, deletedAt: '', userId: userId, snoozedAt: ''}]
      if (!userId) {
        const message = { success: [], errors: [{ message: `You aren't logged` }] }
        res.status(412).json(message)
        return
      }
      const updatedValue = {
        snoozeUntil: new Date(new Date().setDate(new Date().getDate() + 1)),
        snoozedAt: new Date()
      }
      let response = await Utils.cards.fetchCards(id, '__key__', filters)
      let cards = response.cards
      cards = Utils.cards.updateCards(updatedValue, cards)
      if (cards.length) {
        CardRepository.update(cards[0])
          .then(() => res.status(200).json(Object.assign({}, {status: { message: `Operation success`, success: true }})))
          .catch(err => {
            const {message, success} = err
            res.status(500).json({status: {message, success}})
          })
      } else {
        const response = {status: {message: `Card not found`, success: false}}
        res.status(404).json(response)
      }
    }

    /**
     * Verify if has a user doing the operation and updates de card target
     * to readed
     * @param {Object} req
     * @param {Object} res
     */
    static async markAsRead (req, res) {
      const { id } = req.params
      const userId = req.headers.userid && req.headers.userid
      const readApp = req.headers.isapp && true
      const toUpdate = readApp ? {readedApp: new Date()} : {readedWeb: new Date()}
      const filters = [{active: true, deletedAt: '', userId: userId}]
      const message = { success: [], errors: [{ message: `You aren't logged` }] }
      if (!userId) {
        res.status(412).json(message)
        return
      }
      re.status(200).json(Utils.cards.appendResponseMessage(true,'Operation success'));
     /* let response = await Utils.cards.fetchCards(id, '__key__', filters)
      let cards = response.cards
      cards = Utils.cards.updateCards(toUpdate, cards)
      if (cards.length) {
        CardRepository.update(cards[0])
          .then(() => res.status(200).json(Object.assign({}, {status: { message: `Operation success`, success: true }})))
          .catch(err => {
            const {message, success} = err
            res.status(500).json({status: {message, success}})
          })
      } else {
        const response = {status: {message: `Card not found`, success: false}}
        res.status(404).json(response)
      }*/
    }

    /**
     * Verify if has a user doing the operation and sends the user Id
     * and Card id to delete repository
     * @param {Object} req
     * @param {Object} res
     */

    static async deleteByCombination (req, res) {
      const userId = req.headers.userid && req.headers.userid
      const filters = [{all: 'all'}]
      const keysCollection = req.body.cards
      const response = {success: [], errors: []}
      let finalResponse = {}
      const searchResults = new Map()
      const searchPromises = []
      const failed = []

      if (!userId) {
        res.status(412).json({ status: Utils.cards.appendResponseMessage(false, `You aren't logged`) })
        return
      }

      if (!keysCollection || keysCollection.length < 1) {
        const message = { status: Utils.cards.appendResponseMessage(false, `Empty Content`) }
        res.status(412).json(message)
        return
      }

      let collectionIndexes = keysCollection.length
      while (collectionIndexes--) {
        const combination = `${keysCollection[collectionIndexes].campaignId}-${keysCollection[collectionIndexes].userId}`
        const updateValue = {deletedAt: new Date(), deletedBy: userId}
        const promise = Utils.cards.fetchCards(combination, 'combination', filters)
          .then(res => {
            const cards = res.cards
            if (cards.length) {
              res = Utils.cards.updateCards(updateValue, cards)
              searchResults.set(`${cards[0].campaignId}-${cards[0].userId}`, res[0])
              response.success.push({userId: cards[0].userId, campaignId: cards[0].campaignId})
            }
          })
          .catch(err => console.error(JSON.stringify(err)))
        searchPromises.push(promise)
      }
      await Promise.all(searchPromises)
      collectionIndexes = keysCollection.length
      let card = {}
      let combination = ''
      while (collectionIndexes--) {
        combination = `${keysCollection[collectionIndexes].campaignId}-${keysCollection[collectionIndexes].userId}`
        card = searchResults.get(combination)
        if (!card) {
          failed.push(keysCollection[collectionIndexes])
        }
      }

      response.errors = failed
      response.success = [...searchResults.values()]
      if (response.success.length) {
        CardRepository.update(response.success)
          .then(() => {
            finalResponse = {status: {message: `Operation success`, success: true, details: response}}
            res.status(200).json(finalResponse)
          })
      } else {
        finalResponse = { status: Utils.cards.appendResponseMessage(false, `Cards Not Found`), details: response }
        res.status(404).json(finalResponse)
      }
    }

    /**
     * Verify if has a user doing the operation and sends the user Id and Camapign id to delete repository
     * @param {Object} req
     * @param {Object} res
     */
    static async deleteByCampaignId (req, res) {
      const { id } = req.params
      const userId = req.headers.userid && req.headers.userid
      const propertyReference = 'campaignId'
      const entityReference = 'Card'
      let filters = [{limit: 500}]
      let response = null

      if (!userId) {
        res.status(412).json({ status: Utils.cards.appendResponseMessage(false, `You aren't logged`) })
        return
      }

      const {infoJobs} = await Utils.infoJobs.check({
        userId,
        idReference: id,
        propertyReference,
        entityReference
      })

      const status = infoJobs[0] ? infoJobs[0].status : ''
      if (status !== InfoJobsRepository.RUNNING) {
        response = await Utils.cards.fetchCards(id, 'campaignId', filters)
        .catch(err => console.error(JSON.stringify(err)))
        if (response.cards.length) {
          await Utils.infoJobs.create({
            createdBy: userId,
            idReference: id,
            propertyReference,
            entityReference,
            dateStart: new Date(),
            operation: 'DELETE',
            status: InfoJobsRepository.RUNNING
          })
          res.status(200).json({status: Utils.cards.appendResponseMessage(true, `Operation Registred, please wait`)})
          Utils.cards.deleteCards(response.cards, userId, id, propertyReference, filters)
        } else {
          res.status(404).json({status: Utils.cards.appendResponseMessage(false, `Card not found`)})
        }
      } else {
        res.status(202).json({
          status: Utils.cards.appendResponseMessage(true, `This operation still running, please wait`)
        })
      }
    }

    static async deleteByCampaignGroup (req, res) {
      const { id } = req.params
      const userId = req.headers.userid && req.headers.userid
      const filters = [{deletedAt: '', infos: '', limit: 500, paged: ''}]
      const promises = []
      if (!userId) {
        res.status(412).json({ status: Utils.cards.appendResponseMessage(false, `You aren't logged`) })
        return
      }
      let control = ''
      let cards = []
      while (control !== 'NO_MORE_RESULTS') {
        const results = await Utils.cards.fetchCards(id, 'campaignGroup', filters)
        if (control === '' && !results[0].length) {
          res.status(404).json({status: Utils.cards.appendResponseMessage(false, `Card not found`)})
          return
        }
        filters[0].page = results[1].endCursor
        control = results[1].moreResults
        cards = Utils.cards.updateCards({deletedAt: new Date(), deletedBy: userId}, results[0])
        promises.push(CardRepository.update(cards))
      }
      await Promise.all(promises)
        .then(() => {
          res.json({status: Utils.cards.appendResponseMessage(true, `Operation Success`)})
        })
        .catch(err => {
          console.error(JSON.stringify(err))
          res.status(500).json({status: Utils.cards.appendResponseMessage(false, err)})
        })
    }

    /**
     * Verify if has a user doing the operation and sends the user Id and Card id to Get repository
     * @param {Object} req
     * @param {Object} res
     */
    static async getByMenuId (req, res) {
      const { id } = req.params
      const userId = req.headers.userid && req.headers.userid
      const filters = Object.assign({}, req.query, {userId}, {active: true}, {dated: ''}, {snoozed: ''})
      const prop = 'menu'
      if (!userId) {
        res.status(412).json({ status: Utils.cards.appendResponseMessage(false, `You aren't logged`) })
        return
      }
      CardRepository.get(id, prop, filters)
        .then(data => {
          const status = Utils.cards.appendResponseMessage(true)
          const response = data
          res.status(200).json({response, status})
        })
        .catch(err => res.status(412).json(Utils.cards.appendResponseMessage(false, err)))
    }

    /**
     * Verify if has a user doing the operation and sends the user Id and Card id to Get repository
     * @param {Object} req
     * @param {Object} res
     */
    static async getByUserId (req, res) {
      const userId = req.headers.userid && req.headers.userid
      const clientId = req.headers.clientid && req.headers.clientid
      const country = req.headers.country || 'BR'
      let filters = ''
      if (clientId) {
        filters = Object.assign({}, req.query, {active: true}, {dated: ''}, {clientId}, {snoozed: ''}, {ordered: ''}, {limited: ''}, {country})
      } else {
        filters = Object.assign({}, req.query, {active: true}, {dated: ''}, {snoozed: ''}, {ordered: ''}, {limited: ''}, {country})
      }

      if (!userId) {
        res.status(412).json({ status: Utils.cards.appendResponseMessage(false, `You aren't logged`) })
        return
      }

      CardRepository.get(userId, 'userId', filters)
        .then(data => {
          const status = Utils.cards.appendResponseMessage(true)
          const response = data
          return res.status(200).json({response, status})
        })
        .catch(err => {
          console.error(JSON.stringify(err))
          res.status(412).json(Utils.cards.appendResponseMessage(false, err))
        })
    }

    /**
     * Verify if has a user doing the operation and sends the user Id and Card id to Get repository
     * @param {Object} req
     * @param {Object} res
     */
    static async getByCountry (req, res) {
      const { userid, country } = req.headers
      const userId = userid
      const filters = Object.assign({}, req.query, {userId}, {active: true}, {dated: ''})
      if (!userId) {
        res.status(412).json({ status: Utils.cards.appendResponseMessage(false, `You aren't logged`) })
      } else if (!country) {
        res.status(412).json({ status: Utils.cards.appendResponseMessage(false, `You aren't logged`) })
      }

      CardRepository.get(userId, 'userId', filters)
        .then(data => {
          const status = Utils.cards.appendResponseMessage(true)
          const response = data
          res.status(200).json({response, status})
        })
        .catch(err => {
          console.error(JSON.stringify(err))
          res.status(412).json(Utils.cards.appendResponseMessage(false, err))
        })
    }

    /**
     * Verify if has a user doing the operation and sends the user Id and Card id to Get repository
     * @param {Object} req
     * @param {Object} res
     */
    static async getByClientId (req, res) {
      const {userid, clientid} = req.headers
      const userId = userid
      const clientId = clientid

      if (!userId) {
        res.status(412).json({ status: Utils.cards.appendResponseMessage(false, `You aren't logged`) })
      } else if (!clientId) {
        res.status(412).json({ status: Utils.cards.appendResponseMessage(false, `You aren't logged`) })
      }
      CardRepository.get(userId, 'userId', {clientId})
        .then(data => {
          const status = Utils.cards.appendResponseMessage(true)
          const response = data
          res.status(200).json({response, status})
        })
        .catch(err => {
          console.error(JSON.stringify(err))
          res.status(412).json(Utils.cards.appendResponseMessage(false, err))
        })
    }
    /**
     * Verify if has a user doing the operation and sends the user Id and Card id to Get repository
     * @param {Object} req
     * @param {Object} res
     */
    static async read (req, res) {
      const { id } = req.params
      const userId = req.headers.userid && req.headers.userid
      const filters = Object.assign({}, req.query, {active: true}, {dated: ''})
      if (!userId) {
        res.status(412).json({ status: Utils.cards.appendResponseMessage(false, `You aren't logged`) })
        return
      }
      re.status(200).json(Utils.cards.appendResponseMessage(true,'Operation success'));
     /* CardRepository.get(id, '__key__', filters)
        .then(data => {
          const response = Object.assign({}, {response: data}, {status: Utils.cards.appendResponseMessage(true)})
          res.status(200).json(response) 
        })
        .catch(err => res.status(412).json(Utils.cards.appendResponseMessage(false, err)))*/
    }

    static async getByCreateId (req, res) {
      const { id } = req.params
      const userId = req.headers.userid && req.headers.userid
      const filters = Object.assign({}, req.query, {active: true}, {dated: ''}, {userId})
      if (!userId) {
        res.status(412).json({ status: Utils.cards.appendResponseMessage(false, `You aren't logged`) })
        return
      }
      CardRepository.get(id, 'createId', filters)
        .then(data => {
          const response = Object.assign({}, {response: data}, {status: Utils.cards.appendResponseMessage(true)})
          res.status(200).json(response)
        })
        .catch(err => res.status(412).json(Utils.cards.appendResponseMessage(false, err)))
    }

    static async listByCreateId (req, res) {
      const { id } = req.params
      const userId = req.headers.userid && req.headers.userid
      const filters = Object.assign({}, req.query, {active: true})
      const prop = 'createId'
      if (!userId) {
        res.status(412).json({ status: Utils.cards.appendResponseMessage(false, `You aren't logged`) })
        return
      }

      CardRepository.get(id, prop, filters)
        .then(data => {
          const status = Utils.cards.appendResponseMessage(true)
          const response = data
          res.status(200).json({response, status, quantity: response.cards.length})
        })
        .catch(err => {
          console.error(JSON.stringify(err))
          res.status(412).json(Utils.cards.appendResponseMessage(false, err))
        })
    }

    static async getMenus (req, res) {
      const userId = req.headers.userid && req.headers.userid
      const clientId = req.headers.clientid && req.headers.clientid
      let filters = ''
      if (clientId) {
        filters = Object.assign({}, req.query, {active: true}, {dated: ''}, {clientId}, {snoozedAt: ''}, {ordered: ''}, {limited: ''})
      } else {
        filters = Object.assign({}, req.query, {active: true}, {dated: ''}, {snoozedAt: ''}, {ordered: ''}, {limited: ''})
      }
      if (!userId) {
        res.status(412).json({ status: Utils.cards.appendResponseMessage(false, `You aren't logged`) })
        return
      }
      CardRepository.get(userId, 'userId', filters)
        .then(data => {
          const menus = new Map()
          for (let i = 0; i < data.cards.length; i++) {
            menus.set(data.cards[i].menu, data.cards[i].menu)
          }
          const status = Utils.cards.appendResponseMessage(true)
          const response = { menus: [...menus.values()] }
          res.status(200).json({response, status})
        })
        .catch(err => {
          console.error(JSON.stringify(err))
          res.status(412).json(Utils.cards.appendResponseMessage(false, err))
        })
    }

    static async purge (req, res) {
      const userId = req.headers.userid && req.headers.userid
      const limit = req.query.limit || 500
      const dated = !!req.query.dated || false
      const daysAgo = parseInt(req.query.days) || 90
      const interval = parseInt(req.query.interval) * 1000 || 2000
      const params  = [Object.assign({}, {purge: ''}, {limit}, {dated}, {interval}, {daysAgo})]
      
      if (limit > 500) {
        res.status(412).json({ status: Utils.cards.appendResponseMessage(false, `Limit can't be greater than 500`)})
        return
      }
      
      if (!userId) {
        res.status(412).json({ status: Utils.cards.appendResponseMessage(false, `You aren't logged`)})
        return
      }
      const operationId = uuid()
      await Utils.infoJobs.create({
        createdBy: userId,
        idReference: operationId,
        propertyReference: 'NONE',
        entityReference: 'Card',
        dateStart: new Date(),
        operation: 'PURGE',
        status: InfoJobsRepository.RUNNING
      })
      const { cards } = await Utils.cards.fetchCards('_', '_', params)
      Utils.cards.purge(cards, params, operationId).catch(err => console.error(JSON.stringify(err)))
      res.status(200).json( 
        {
          status: Object.assign({}, Utils.cards.appendResponseMessage(true, `Operation Registred, please wait`), {operationId})
        }
      )
    }

    static async countByCampaingId (req, res) {
      const { id } = req.params
      const userId = req.headers.userid && req.headers.userid
      const filters = Object.assign({}, req.query, {active: true}, {select: '__key__'})
      const prop = 'campaignId'
      if (!userId) {
        res.status(412).json({ status: {success: false, message: `You aren't logged`} })
        return
      }
      CardRepository.get(id, prop, filters)
        .then(data => {
          const status = Utils.cards.appendResponseMessage(true)
          const response = data
          res.status(200).json({status, quantity: response.cards.length})
        })
        .catch(err => {
          console.log(err)
          res.status(412).json(Utils.cards.appendResponseMessage(false, err))
        })
    }
  }
  return CardController
}
