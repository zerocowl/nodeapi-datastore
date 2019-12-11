module.exports = () => {
  class User {
    constructor (userId = '', firstSignIn = '', lastSignIn = '',
      country = '', client = '', active = true, deletedAt = '') {
      this.userId = userId
      this.firstSignIn = firstSignIn
      this.lastSignIn = lastSignIn
      this.country = country
      this.clientId = client
      this.active = active
      this.deletedAt = deletedAt
    }
  }
  return User
}
