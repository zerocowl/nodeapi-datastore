module.exports = app => {
  const ds = app.infrastructure.repositories.datasource
  class HealthRepository {
    /**
     * Checks the if connection with datastore is ok
     * id: prop's identification
     * props (Optional, get by userId by default): describes what kind of get will be done
     * args (Optional, filters): params to make filter
     * @param {Number} id
     * @param {String} prop
     * @param {Any} args
     */
    static async check () {
      const query = ds.createQuery().select('__key__').limit(1)
      return ds.runQuery(query)
    }
  }

  return HealthRepository
}
