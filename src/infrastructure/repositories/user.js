module.exports = app => {
  const ds = app.infrastructure.datasource
  const User = app.domain.models.user
  class UserRepository {
    /**
     * Create a card providing:
     * bulk: one or more cards into a array
     * @param {Array} bulk
     */
    static async create (user) {
      /* attach cards that've failed in validation to response message:
      * foo.concat({failed:failedCards})
      */
      user = this.generateEntity(user)
      return ds.save(user)
        .then(data => data)
        .catch(err => err)
    }

    /**
     * Updates a user providing:
     * id: prop's identification
     * userId: the user that's doing the deletion
     * @param {object} user
     */
    static async update (user) {
      const newUser = Object.assign({}, user[0], {lastSignIn: new Date()})
      return ds.update(this.toDatastore(newUser))
    }
    /**
     * Gets a User providing
     * id: prop's identification
     * props (Optional, get by userId by default): describes what kind of get will be done
     * args (Optional, filters): params to make filter
     * @param {Number} id
     * @param {String} prop
     * @param {Any} args
     */
    static async get (id, prop = 'userId', ...args) {
      // Kind is document name
      const kind = 'User'
      // Create GCloud Datastore query
      const query = this.generateQuery(kind, prop, id, args[0])
      return ds.runQuery(query)
        .then(data => {
          const results = data[0].map(record => this.fromDatastore(record))
          return new Promise(resolve => resolve(results))
        })
        .catch(err => Promise.reject(err))
    }

    /**
     * Attaches to incoming object the entity id
     * @param {Object} obj
     */
    static fromDatastore (obj) {
      obj.id = obj[ds.KEY].id
      return obj
    }

    /**
     * Removes from object the entity id
     * @param {Object} obj
     */
    static toDatastore (obj) {
      if (obj.length) {
        obj = obj.map(el => {
          delete el.id
          return el
        })
      } else {
        delete obj.id
      }

      return obj
    }

    /**
     *  Generate GCloud Datastore entity
     *  @param {Object} newUser
     */
    static generateEntity (newUser) {
      const entity = {
        key: ds.key(new User().constructor.name),
        data: new User(newUser.userId, new Date(), new Date(), newUser.country,
          newUser.clientId, newUser.clientId)
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
      const key = keyType === '__key__' ? ds.key([kind, parseInt(id)]) : id
      let resultQuery = ds.createQuery(kind)
        .filter(keyType, key)
      if (typeof filters === 'object') {
        for (let key in filters) {
          switch (key) {
            default:
              resultQuery = resultQuery.filter(key, filters[key])
              break
          }
        }
      }
      return resultQuery
    }
  }

  return UserRepository
}
