import expressWinston from 'express-winston'

module.exports = app => {
  app.use(expressWinston.logger({
    winstonInstance: app.logger,
    level: (req, res) => {
      let level = 'debug'
      if (res.statusCode >= 500) { level = 'error' }
      if (res.statusCode >= 400) { level = 'warn' }
      return level
    }
  }))
}
