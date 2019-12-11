require('dotenv').config()
const config = require(`./config.${process.env.NODE_ENV}.js` || `./config.developemnt.js` )
const logger = require('./log')(config)

module.exports = (app) => {
  app.logger = logger
  app.config = config
}
