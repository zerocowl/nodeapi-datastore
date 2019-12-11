module.exports = () => {
  /**
   * validatorjs validation schema
   */
  const card = {
    dateStart: 'date|required',
    dateEnd: 'date|required',
    template: 'string|required',
    metadata: 'array|required',
    tags: 'array',
    userId: 'string|required',
    campaignId: 'required',
    createdBy: 'string|required',
    priority: 'integer|required',
    createId: 'string|required'
  }
  return card
}
