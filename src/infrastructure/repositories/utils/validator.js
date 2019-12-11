const Validator = require('validatorjs')
const rules = require('../../../domain/models/model_rules/rulesBundler')
module.exports = () => {
  class Validation {
    /**
     * Picks a data and its kind and validate
     * @param {any} data
     * @param {String} kind
     */
    static validate (data, kind) {
      switch (kind) {
        case 'CARD': {
          let metaCards = []
          const cardRules = rules.card()
          data.map(card => {
            const validation = new Validator(card, cardRules)
            if (validation.fails()) {
              metaCards.push({ insert: false, message: 'invalid fields', detail: validation.errors.all(), card })
            } else {
              metaCards.push({ insert: true, detail: [], card })
            }
          })
          const failedCards = metaCards.filter(el => !el.insert)
          const validatedBulk = metaCards.filter(el => el.insert)
          return { validatedBulk, failedCards }
        }

        case 'ID': {
          data = { id: data }
          const rule = { id: 'string|required' }
          const validation = new Validator(data, rule)
          if (validation.fails()) {
            return {errors: validation.errors.all()}
          }
          return false
        }

        case 'QUERY': {
          const validation = new Validator(data, rules.query())
          if (validation.fails()) {
            return {errors: validation.errors.all()}
          }
          return false
        }
        
        default:
          throw new Error('Kind isn\'t supported')
      }
    }
  }

  return Validation
}
