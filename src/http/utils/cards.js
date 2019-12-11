module.exports = app => {
  const CardRepository = app.infrastructure.repositories.card
  const InfoJobsRepository = app.infrastructure.repositories.infoJobs

  async function fetchCards (id, prop, filters) {
    return CardRepository.get(id, prop, ...filters).catch(err => console.error(err))
  }

  function updateCards (value, cards) {
    let updatedCards = []
    let i = cards.length
    while (i--) {
      cards[i].metadata = JSON.stringify(cards[i].metadata)
      updatedCards.push(Object.assign({}, cards[i], value))
    }
    return updatedCards
  }

  function appendResponseMessage (success, message = '') {
    return { success, message }
  }

  async function eraseDuplicatedsFromDB (bulk, repository) {
    const toInsert = new Map()
    const promises = []
    let bulkIndex = bulk.length

    while (bulkIndex--) {
      toInsert.set(`${bulk[bulkIndex].campaignId}-${bulk[bulkIndex].userId}`, bulk[bulkIndex])
    }

    let willDelete = []
    const toInsertKeys = [...toInsert.keys()]
    let toInsertIndexes = toInsertKeys.length

    while (toInsertIndexes--) {
      if (!toInsert.get(toInsertKeys[toInsertIndexes]).country) {
        toInsert.get(toInsertKeys[toInsertIndexes]).country = 'BR'
      }
      promises.push(repository.get(`${toInsertKeys[toInsertIndexes]}`, 'combination', {deletedAt: ''}))
    }

    if (promises.length) {
      let cards = await Promise.all(promises)
      let cardsIndexes = cards.length

      while (cardsIndexes--) {
        willDelete = willDelete.concat(cards[cardsIndexes].cards)
      }
    }

    if (willDelete.length) {
      repository.fisicalDelete(willDelete)
    }

    return [...toInsert.values()]
  }

  async function deleteCards (cards, userId, id, prop, filters) {
    cards = updateCards({deletedAt: new Date(), deletedBy: userId}, cards)
    CardRepository.update(cards)
      .then(async () => {
        const response = await fetchCards(id, prop, filters)
        if (response.cards.length) {
          deleteCards(response.cards, userId, id, prop, filters)
        } else {
          InfoJobsRepository.update(
            {
              idReference: id,
              propertyReference: prop,
              entityReference: 'Card'
            },
            {
              status: InfoJobsRepository.DONE,
              dateEnd: new Date()
            }
          )
        }
      })
  }

  async function purge (cards, filters, id) {
    await CardRepository.fisicalDelete(cards)
      .then(() => console.log("Purged: ", cards.length))
      .catch(err => console.error(JSON.stringify(err)))
    setTimeout( async () => {
      const response = await fetchCards('_', '_', filters)
      if (response.cards.length) {
        console.log('to purge: ', response.cards.length)
        purge(response.cards, filters, id)
      } else {
        InfoJobsRepository.update(
          {
            idReference: id,
            propertyReference: 'NONE',
            entityReference: 'Card'
          },
          {
            status: InfoJobsRepository.DONE,
            dateEnd: new Date()
          }
        )
        console.log('DONE')
      }
    }, filters[0].interval)
  }

  return {
    fetchCards,
    updateCards,
    eraseDuplicatedsFromDB,
    appendResponseMessage,
    deleteCards,
    purge
  }
}
