module.exports = app => {
  const UserController = app.http.controllers.user

  app.route('/user/country/')
    .get(UserController.getByCountry)
}
