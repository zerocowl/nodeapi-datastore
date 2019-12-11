
module.exports = app => {
  const orchestraController = app.http.controllers.orchestra
  
  app.route('/orchestra')
    .get(orchestraController.callOrchestrator)
}