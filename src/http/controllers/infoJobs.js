module.exports = app => {
  const InfoJobsRepository = app.infrastructure.repositories.infoJobs

  class InfoJobsController {
    /**
     *
     * @param {Object} req
     * @param {Object} res
     */
    static async checkStatusJob (req, res) {
      const userId = req.headers.userid || ''
      const { id } = req.params
      const propertyReference = req.query.property || 'campaignId'
      const entityReference = 'Card'

      if (!userId) {
        const message = {status: { success: false, message: `You aren't logged` }}
        res.status(412).json(message)
        return
      }

      const {infoJobs} = await InfoJobsRepository.checkDeleteProcessStatus({
        idReference: id,
        propertyReference,
        entityReference
      })
      if (infoJobs[0]) {
        const status = infoJobs[0].status
        res.status(200).json({ status: {success: true, message: status} })
      } else {
        res.status(200).json({ status: {success: false, message: 'Job not found'} })
      }
    }
  }
  return InfoJobsController
}
