import AWS from 'aws-sdk'
module.exports = app => {
  class OrchestraController {
    static async callOrchestrator (req, res) {
      const dateStart = req.query.start || ''
      const dateEnd = req.query.end || ''
      const lambda = new AWS.Lambda()
      const response = {status: {success: false, message: ''}}
      const params = {
        dateStart,
        dateEnd
      }

      lambda.invoke(params, (err, data) => {
        if(err) {
          console.error(err)
          respponse.status.message = JSON.stringify(err)
          return res.status(500).json(response)
        }
      })
      console.log(params)
      response.status.success = true
      respponse.status.message = params
      res.json(response)
    }
  }
  return OrchestraController
}
