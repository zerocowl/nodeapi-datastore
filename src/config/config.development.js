const config = {
  debug: {
    level: 'debug',
    available: true
  },
  secret: 'secret',
  jwtSession: { session: false },
  port: process.env.APP_PORT || 8082
}

module.exports = config
