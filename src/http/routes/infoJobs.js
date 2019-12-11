module.exports = app => {
  const InfoJobsController = app.http.controllers.infoJobs
  app.route('/jobs/check/:id')
    .get(InfoJobsController.checkStatusJob)
}
