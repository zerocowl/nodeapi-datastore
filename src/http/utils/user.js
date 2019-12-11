const whiteList = clientId => {
  const COLABORADOR = process.env.ID_COLABORADOR || '81d6d932-2163-38a9-94b8-13960d76111e'
  const LATAM = process.env.ID_LATAM || 'f50f9e6d-f390-396f-b9da-6f1155794e28'
  const list = [COLABORADOR, LATAM]
  return list.includes(clientId)
}

module.exports = {whiteList}
