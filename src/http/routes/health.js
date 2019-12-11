module.exports = app => {
  const healthController = app.http.controllers.health
  /**
   * @api {get} /health Health Check API
   * @apiGroup Health
   * @apiSuccessExample {json} Success
   *    HTTP/1.1 200 OK
   *    {
   *      status: 200,
   *      message: 'success on conect services'
   *    }
   * @apiErrorExample {json} Internal server error
   *    HTTP/1.1 500 Internal server error
   *    {
   *      status: 500,
   *      message: 'error o connect services'
   *    }
   */
  app.get('/api/health', healthController.api)
  app.get('/db/health', healthController.db)
}
