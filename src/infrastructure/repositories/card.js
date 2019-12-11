module.exports = app => {
  const ds = app.infrastructure.datasource
  const Card = app.domain.models.card
  class CardRepository {
    /**
     * Create cards providing:
     * bulk: one or more cards into a array
     * @param {Array} bulk
     */
    static async create (bulk) {
      const entityBulk = this.buildCards(bulk)
      return ds.save(entityBulk)
    }

    /**
     * Updates a card providing:
     * @param {Object} card
     */
    static async update (card) {
      return ds.update(this.toDatastore(card))
    }

    /**
     * Gets a card providing
     * id: prop's identification
     * props (Optional, get by userId by default): describes what kind of get will be done
     * args (Optional, filters): params to make filter
     * @param {Number} id
     * @param {String} prop
     * @param {Any} args
     */
    static async get (id, prop = 'userId', ...args) {
      const limit = args[0].limit && args[0].limit
      const page = args[0].page && args[0].page

      // Kind is document name
      const kind = 'Card'
      // Create GCloud Datastore query
      const query = this.generateQuery(kind, prop, id, args[0])
      return ds.runQuery(query)
        .then(data => {
          const filters = Object.keys(args[0]).map(key => key)
          // this's a special case
          if (filters.find(el => el === 'infos')) {
            data[0] = this.fromDatastore(data[0])
            return data
          } else {
            let results = this.filterValidCards(data[0], filters)
            let moreResults = ''
            let nextPage = ''
            if (filters.find(el => el === 'limited')) {
              const response = this.paginateResponse(results, limit, page)
              moreResults = response.moreResults
              results = response.results
            } else {
              moreResults = !(data[1].moreResults === ds.NO_MORE_RESULTS)
              nextPage = encodeURIComponent(data[1].endCursor)
            }

            return new Promise(resolve => resolve({ cards: results, moreResults, nextPage }))
          }
        })
        .catch(err => Promise.reject(err))
    }

    static paginateResponse (results, limit, page) {
      const ordered = [].concat(results)
      results = this.limiter(results, limit, page)
      let moreResults = results.length ? !results.find(el => el.id === ordered[ordered.length - 1].id) : false
      return {results, moreResults}
    }

    static filterValidCards (cards, filters) {
      if (filters.find(el => el === 'dated')) {
        cards = this.filterDateStart(cards)
        cards = this.filterDateEnd(cards)
      }
      if (filters.find(el => el === 'snoozed')) {
        cards = this.filterSnooze(cards)
      }
      let results = []
      for (let i = 0; i < cards.length; i++) {
        results.push(this.fromDatastore(cards[i]))
      }
      if (filters.find(el => el === 'ordered')) {
        results.sort((actual, next) =>
          new Date(next.createdAt.toDateString()) - new Date(actual.createdAt.toDateString()) ||
          actual.priority - next.priority ||
          next.createdAt - actual.createdAt)
      }
      return results
    }
    /**
     * Attaches to incoming object the entity id
     * @param {Object} obj
     */
    static fromDatastore (raw) {
      if (raw.length) {
        raw = raw.map(card => {
          card.id = card[ds.KEY].id
          if (typeof raw.metadata === 'string') {
            card.metadata = JSON.parse(card.metadata)
          }
          return card
        })
      } else if (raw[ds.KEY]) {
        raw.id = raw[ds.KEY].id
        if (typeof raw.metadata === 'string') {
          raw.metadata = JSON.parse(raw.metadata)
        }
      }
      return raw
    }
    /**
     * Removes from object the entity id
     * @param {Object} obj
     */
    static toDatastore (obj) {
      if (obj.length) {
        obj = obj.map(el => {
          const key = el.id
          delete el.id
          obj.metadata = JSON.stringify(obj.metadata)
          return { key: ds.key(['Card', parseInt(key)]), data: el, excludeFromIndexes: ['metadata'] }
        })
        return obj
      } else {
        var key = obj.id
        obj.metadata = JSON.stringify(obj.metadata)
        delete obj.id
      }
      return { key: ds.key(['Card', parseInt(key)]), data: obj, excludeFromIndexes: ['metadata'] }
    }

    /**
     *  Generate GCloud Datastore entity
     *  @param {Object} newCard
     */
    static generateEntity (newCard, kind = 'Card') {
      const entity = {
        key: ds.key(kind),
        data: [
          {name: 'userId', value: newCard.userId},
          {name: 'createId', value: newCard.createId},
          {name: 'dateStart', value: new Date(newCard.dateStart)},
          {name: 'dateEnd', value: new Date(newCard.dateEnd)},
          {name: 'metadata', value: JSON.stringify(newCard.metadata), excludeFromIndexes: true},
          {name: 'template', value: newCard.template},
          {name: 'tags', value: newCard.tags},
          {name: 'description', value: newCard.description},
          {name: 'menu', value: newCard.menu},
          {name: 'active', value: newCard.active},
          {name: 'campaignId', value: newCard.campaignId},
          {name: 'createdBy', value: newCard.createdBy},
          {name: 'deletedBy', value: newCard.deletedBy},
          {name: 'createdAt', value: new Date()},
          {name: 'deletedAt', value: newCard.deletedAt},
          {name: 'priority', value: newCard.priority},
          {name: 'dismissedAt', value: newCard.dismissedAt},
          {name: 'country', value: newCard.country},
          {name: 'clientId', value: newCard.clientId},
          {name: 'readedWeb', value: newCard.readedWeb},
          {name: 'readedApp', value: newCard.readedApp},
          {name: 'snoozedAt', value: newCard.snoozedAt},
          {name: 'snoozeUntil', value: newCard.snoozeUntil},
          {name: 'combination', value: `${newCard.campaignId}-${newCard.userId}`},
          {name: 'campaignGroup', value: newCard.campaignGroup}
        ]
      }
      return entity
    }

    /**
     * Generate a query to Google Datastore
     * @param {String} kind kind of entity
     * @param {String} keyType id Key type
     * @param {Number} id id key
     * @param {Array} filters filters that compose the query
     */
    static generateQuery (kind, keyType, id, filters) {
      let paged = false
      let appLimit = false
      let limit = 10
      if (typeof filters === 'object') {
        for (let key in filters) {
          if (key === 'limit') {
            limit = filters[key]
          }
          if (key === 'paged') {
            paged = true
          }
          if (key === 'limited') {
            appLimit = true
          }
        }
      }
      const key = keyType === '__key__' ? ds.key([kind, parseInt(id)]) : id
      let resultQuery = ds.createQuery(kind) 
      if (filters['all']) {
        resultQuery = resultQuery.filter(keyType, key)
      } else {
        resultQuery = resultQuery.filter(keyType, key).filter('deletedAt', '')
      }
      if (typeof filters === 'object') {
        for (let key in filters) {
          switch (key) {
            case 'all':
              break
            case 'dated':
              break
            case 'page':
              if (paged) {
                const cursor = decodeURIComponent(filters[key])
                resultQuery = resultQuery.start(cursor)
              }
              break
            case 'limit':
              if (!appLimit) {
                resultQuery = resultQuery.limit(limit)
              }
              break
            case 'limited':
              break
            case 'paged':
              break
            case 'key':
              break
            case 'ordered':
              break
            case 'snoozed':
              break
            case 'select':
              resultQuery = resultQuery.select(filters[key])
              break
            case 'infos':
              break
            case 'purge':
              const date = filters['firstRun'] ? new Date('2018-01-01') : this.getDateAgo(filters['daysAgo'])
              resultQuery = null
              // force query to be just with this condition
              resultQuery = ds.createQuery(kind)
                .filter('deletedAt', '>=', date)
                .filter('deletedAt', '<=', new Date())
                .limit(filters['limit'])
              break
            case 'firstRun':
              break
            case 'interval':
              break
            case 'daysAgo':
              break
            default:
              resultQuery = resultQuery.filter(key, filters[key])
              break
          }
        }
      }
      return resultQuery
    }

    static buildCards (rawCards) {
      let entityBulk = rawCards.map(meta => {
        if (meta.insert) {
          const newCard = new Card(meta.card)
          const entity = this.generateEntity(newCard)
          return entity
        }
      })
      // purge undefined entities from array
      return entityBulk.filter(el => el)
    }

    static async fisicalDelete (cards) {
      const keys = []
      for (let i = 0; i < cards.length; i++) {
        keys.push(ds.key(['Card', parseInt(cards[i].id)]))
      }
      ds.delete(keys)
    }
    /**
     * This method handles with a limitation of Google Datastore
     * It filters the cards that has been inactivated by Date
     * @param Cards {Array} Card collection of cards from database
     */
    static filterDateEnd (cards) {
      let filtered = []

      for (let i = 0; i < cards.length; i++) {
        if (new Date(cards[i].dateEnd) >= new Date()) {
          filtered.push(cards[i])
        }
      }
      return filtered
    }

    static filterDateStart (cards) {
      let filtered = []

      for (let i = 0; i < cards.length; i++) {
        if (new Date(cards[i].dateStart) <= new Date()) {
          filtered.push(cards[i])
        }
      }
      return filtered
    }

    static filterSnooze (cards) {
      let filtered = []
      for (let i = 0; i < cards.length; i++) {
        if (new Date(cards[i].snoozeUntil) <= new Date() || !cards[i].snoozeUntil) {
          filtered.push(cards[i])
        }
      }
      return filtered
    }

    static filterClientId (cards, clientId) {
      const filtered = []
      for (let i = 0; i < cards.length; i++) {
        if (cards[i].clientId === clientId) {
          filtered.push(cards[i])
        }
      }
      return filtered
    }

    static limiter (data, limit = 10000000, page = 0) {
      const offset = parseInt(page) * parseInt(limit)
      // end of page
      const EOP = parseInt(offset) + parseInt(limit)
      return data.slice(offset, EOP)
    }

    static getDateAgo(days) {
      return new Date(new Date().getTime() - days * 24 * 60 * 60 * 1000);
    }
  }

  return CardRepository
}
