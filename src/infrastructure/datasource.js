import { Datastore } from '@google-cloud/datastore'

let datasource = null

module.exports = () => {
  if (datasource !== null) return datasource
  datasource = new Datastore()

  return datasource
}
