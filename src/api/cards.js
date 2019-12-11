import request from 'request'
import env from './config'
import {Authentication} from './cognitoAuth'
export const getRetroactiveCards = async (userId, userClientId, country) => {
  const TOKEN = await Authentication()

  if (!TOKEN) {
    Promise.resolve(false)
  }
  const headers = {
    authorization: TOKEN,
    accept: 'application/json',
    'cache-control': 'no-cache',
    'x-api-key': env.X_API_KEY,
    'content-type': 'application/json'
  }
  const data = {
    'country': country,
    'clientId': userClientId
  }
  const options = {
    url: `${env.BACKOFFICE_URL}/cards/retroactive/${userId}`,
    headers,
    method: 'POST',
    body: JSON.stringify(data)
  }

  return new Promise((resolve, reject) => request(options, (err, response, body) => {
    if (err) {
      console.error('Error on create retroactive cards: ')
      console.error(JSON.stringify(err))
      return reject(err)
    }
    return resolve(body)
  }))
}
