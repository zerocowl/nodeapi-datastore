module.exports = app => {
  const HealthRepository = app.infrastructure.repositories.health
  class HealthController {
    static api (req, res) {
      res.json({
        status: 200,
        message: 'success on api connect'
      })
    }
    static db (req, res) {
      const control = setTimeout(() => res.status(500).json({
        status: 500,
        message: 'Error on Database connection '
      }), 20000)
      HealthRepository.check()
        .then(res.json({status: 200, message: 'success on database connect'}))
        .then(clearTimeout(control))
    }
  }
  return HealthController
}
