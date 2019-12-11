import express from 'express'
import swaggerUI from 'swagger-ui-express'
module.exports = app => {
  const swaggerDocument = require('../../swagger/api.json')
  app.set('port', app.config.port)
  app.set('json spaces', 4)
  app.use(express.urlencoded({ limit: '5mb', extended: true }))
  app.use(express.json({ limit: '5mb' }))
  app.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument))
}
