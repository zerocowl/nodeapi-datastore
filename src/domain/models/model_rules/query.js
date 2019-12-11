module.exports = () => {
  /**
   * validatorjs validation schema
   */
  const query = {
    dateStart: 'date',
    dateEnd: 'date',
    template: 'string',
    menu: 'string',
    tags: 'array',
    userId: 'string',
    campaignId: 'string',
    createdBy: 'string',
    createdAt: 'date',
    deletedAt: 'date',
    active: 'boolean'
  }

  return query
}
