import request from 'request'
import env from './config'

export const Authentication = () => {
  const auth = env.TOKEN
  const AUTH_URL = env.AUTH_URL
  const headers = {
    authorization: `Basic ${auth}`,
    'cache-control': 'no-cache',
    'Content-Type': 'application/x-www-form-urlencoded'
  }
  const form = { grant_type: 'client_credentials' }
  const options = {
    method: 'POST',
    url: AUTH_URL,
    headers,
    form
  }
  return new Promise((resolve, reject) => {
    request(options, (err, response, body) => {
      if (err) {
        reject(err)
      }
      if (body) {
        try {
          const resBody = JSON.parse(body)
          const authToken = `${resBody.token_type} ${resBody.access_token}`
          resolve(authToken)
        } catch (e) {
          console.error(JSON.stringify(e))
          reject(e)
        }
      } else {
        reject(new Error('Error on get access token'))
      }
    })
  })
}
