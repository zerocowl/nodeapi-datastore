import { createLogger, transports } from 'winston'

module.exports = (config) => {
  const debugTransports = [
    new (transports.File)({ filename: './log/error.log', level: 'error', maxsize: 10240 }),
    new (transports.Console)({
      colorize: true
    })
  ]

  const logger = createLogger({
    level: config.debug.level,
    transports: debugTransports
  })

  return logger
}
