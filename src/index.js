import express from 'express'
import consign from 'consign'
import { join } from 'path'

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

const app = express()
if (!process.env.IS_TEST_MODE) {
  consign({
    cwd: join(__dirname, ''),
    extensions: ['.js', '.json'],
    verbose: false
  })
    .include('./config/config.js')
    .then('./domain/')
    .then('./infrastructure/')
    .then('./http/utils/')
    .then('./http/middlewares/')
    .then('./http/controllers')
    .then('./http/routes/')
    .then('./swagger/')
    .then('boot.js')
    .into(app)
} else {
  consign({
    cwd: join(__dirname, ''),
    extensions: ['.js', '.json'],
    verbose: false
  })
    .include('./config/config.js')
    .then('./domain/')
    .then('./infrastructure/')
    .then('./http/utils/')
    .then('./http/middlewares/')
    .then('./http/controllers')
    .then('./http/routes/')
    .then('./swagger/')
    .into(app)
}

module.exports = app
