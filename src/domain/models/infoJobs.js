module.exports = () => {
  class InfoJobs {
    constructor ({
      id = '',
      idReference = '',
      propertyReference = '',
      entityReference = '',
      dateStart = new Date(),
      dateEnd = '',
      done = false,
      operation = '',
      status = JSON.stringify({}),
      createdBy = '',
      createdAt = new Date()}) {
      this.id = id
      this.idReference = idReference
      this.propertyReference = propertyReference
      this.entityReference = entityReference
      this.dateStart = dateStart
      this.dateEnd = dateEnd
      this.done = done
      this.status = status
      this.operation = operation
      this.createdBy = createdBy
      this.createdAt = createdAt
    }
  }
  return InfoJobs
}
