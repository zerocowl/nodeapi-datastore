module.exports = app => {
  const ds = app.infrastructure.datasource
  const InfoJobs = app.domain.models.infoJobs
  const KIND = 'InfoJobs'

  class InfoJobsRepository {
    static get RUNNING () {
      return 'RUNNING'
    }

    static get DONE () {
      return 'DONE'
    }

    static async create (oldInfo) {
      const info = Object.assign({}, oldInfo)
      delete info.status
      delete info.dateStart
      const {infoJobs} = await this.get(info)
      if (infoJobs.length) { await this.fisicalDelete(infoJobs) }
      const infoJob = new InfoJobs(oldInfo)
      const storable = this.generateEntity(infoJob)
      return ds.save(storable)
    }

    static async get (filters) {
      let resultQuery = ds.createQuery(KIND)
      if (typeof filters === 'object') {
        for (let key in filters) {
          if (key !== 'select') {
            resultQuery = resultQuery.filter(key, filters[key])
          }
        }
      }
      return ds.runQuery(resultQuery)
        .then(data => {
          let results = data[0].map(record => this.fromDatastore(record))
          return new Promise(resolve => resolve({ infoJobs: results }))
        })
    }

    static async checkDeleteProcessStatus ({idReference, propertyReference, entityReference}) {
      return this.get({idReference, propertyReference, entityReference})
    }

    static async update (filters, values) {
      const {infoJobs} = await this.get(filters)
      if (infoJobs && infoJobs.length) {
        const old = infoJobs[0]
        if (old) {
          const newInfo = Object.assign(old, values)
          return ds.update(this.toDatastore(newInfo))
        }
      } else {
        Promise.reject(new Error('Error on update InfoJob.'))
      }
    }

    static toDatastore (obj) {
      if (obj.length) {
        obj = obj.map(el => {
          const key = el.id
          delete el.id
          return { key: ds.key([KIND, parseInt(key)]), data: el }
        })
        return obj
      } else {
        var key = obj.id
        delete obj.id
      }
      return { key: ds.key([KIND, parseInt(key)]), data: obj }
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
     *  Generate GCloud Datastore entity
     *  @param {Object} _new
     */
    static generateEntity (_new) {
      const entity = {
        key: ds.key(KIND),
        data: [
          {name: 'idReference', value: _new.idReference},
          {name: 'propertyReference', value: _new.propertyReference},
          {name: 'entityReference', value: _new.entityReference},
          {name: 'dateStart', value: _new.dateStart},
          {name: 'dateEnd', value: _new.dateEnd},
          {name: 'operation', value: _new.operation},
          {name: 'status', value: _new.status},
          {name: 'createdBy', value: _new.createdBy},
          {name: 'createdAt', value: _new.createdAt}
        ]
      }
      return entity
    }

    static fisicalDelete (jobs) {
      const keys = []
      for (let i = 0; i < jobs.length; i++) {
        keys.push(ds.key(['InfoJobs', parseInt(jobs[i].id)]))
      }
      ds.delete(keys)
    }
  }

  return InfoJobsRepository
}
