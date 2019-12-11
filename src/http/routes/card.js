module.exports = app => {
  const CardController = app.http.controllers.card
  const User = app.http.middlewares.user
  app.route('/card')
    .post(CardController.create)
    .delete(CardController.purge)
    
  app.route('/card/combination/')
    .delete(CardController.deleteByCombination)

  app.route('/card/user/')
    .get(User.onGetCards, CardController.getByUserId)

  app.route('/card/country/')
    .get(User.onGetCards, CardController.getByCountry)

  app.route('/card/client/')
    .get(User.onGetCards, CardController.getByClientId)

  app.route('/card/:id')
    .put(CardController.dismiss)
    .get(User.onGetCards, CardController.read)

  app.route('/card/campaign/:id')
    .delete(CardController.deleteByCampaignId)

  app.route('/card/campaign/:id/count')
    .get(CardController.countByCampaingId)

  app.route('/card/menu/:id')
    .get(User.onGetCards, CardController.getByMenuId)

  app.route('/card/listByCreateId/:id')
    .get(CardController.listByCreateId)

  app.route('/card/createId/:id')
    .get(CardController.getByCreateId)

  app.route('/card/snooze/:id')
    .put(CardController.snooze)

  app.route('/card/read/:id')
    .put(CardController.markAsRead)

  app.route('/card/campaignGroup/:id')
    .delete(CardController.deleteByCampaignGroup)

  app.route('/card/user/menus')
    .get(CardController.getMenus)
}
