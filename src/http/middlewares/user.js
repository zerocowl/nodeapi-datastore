import { getRetroactiveCards } from '../../api/cards'
import utils from '../utils/user'

module.exports = (app) => {
  const UserRepository = app.infrastructure.repositories.user
  const CardRepository = app.infrastructure.repositories.card
  class UserMiddleware {
    static async onGetCards (req, res, next) {
      const {userid, clientid, country} = req.headers
      if (userid && utils.whiteList(clientid)) {
        try {
          const user = await UserRepository.get(userid, 'userId')
          if (!user.length) {
            await UserRepository.create({clientId: clientid, userId: userid, country})
            let cards = await getRetroactiveCards(userid, clientid, country)
            if (cards.length) {
              cards = JSON.parse(cards)
              if(cards.map) {
                await CardRepository.create(cards)
              }
            } else {
              next()
            }
          } else {
            await UserRepository.update(user)
          }
        } catch (err) {
          console.error(JSON.stringify(err))
        }
      }
      next()
    }
  }
  return UserMiddleware
}
