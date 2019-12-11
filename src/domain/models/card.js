module.exports = () => {
  class Card {
    constructor ({id = '', userId = '', createdBy = '', deletedBy = '', createId = '',
      dateStart = '', dateEnd = '', template = '', metadata = [], tags = [], menu = '',
      campaignId = '', active = true, createdAt = new Date(), deletedAt = '', priority = 0,
      dismissedAt = '', clientId = '', country = '', combination = '', readedWeb = '',
      readedApp = '', snoozedAt = '', snoozeUntil = '', campaignGroup = '',
      description = ''}) {
      this.id = id
      this.createId = createId
      this.userId = userId
      this.dateStart = dateStart
      this.dateEnd = dateEnd
      this.template = template
      this.metadata = metadata
      this.tags = tags
      this.description = description
      this.menu = menu
      this.campaignId = campaignId
      this.active = active
      this.dismissedAt = dismissedAt
      this.createdBy = createdBy
      this.deletedBy = deletedBy
      this.createdAt = createdAt
      this.deletedAt = deletedAt
      this.priority = priority
      this.country = country
      this.clientId = clientId
      this.combination = combination
      this.readedWeb = readedWeb
      this.readedApp = readedApp
      this.snoozedAt = snoozedAt
      this.snoozeUntil = snoozeUntil
      this.campaignGroup = campaignGroup
    }
  }
  return Card
}
