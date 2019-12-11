module.exports = app => {
  const UserRepository = app.infrastructure.repositories.user
  class UserController {
    /**
     *
     * @param {Object} req
     * @param {Object} res
     */
    static async getByCountry (req, res) {
      const { userid, country, clientid } = req.headers
      const userId = userid
      const clientId = clientid || ''
      let filters = clientId ? {clientId} : {}
      if (!userId) {
        res.status(412).json({ status: appendResponseMessage(false, `You aren't logged`) })
      } else if (!country) {
        res.status(412).json({ status: appendResponseMessage(false, `You must specify your Country`) })
      }
      UserRepository.get(country, 'country', filters)
        .then(data => {
          const status = appendResponseMessage(true)
          res.status(200).json({response: {users: data}, status})
        })
        .catch(err => {
          console.error(JSON.stringify(err))
          res.status(412).json(appendResponseMessage(false, err))
        })
    }
  }

  return UserController
}

function appendResponseMessage (success, message = '') {
  return { success, message }
}
