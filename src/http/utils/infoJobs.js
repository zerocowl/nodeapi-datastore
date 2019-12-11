module.exports = app => {
  const InfoJobsRepository = app.infrastructure.repositories.infoJobs

  const create = async (job) => InfoJobsRepository.create(job)

  const check = async (data) => InfoJobsRepository.checkDeleteProcessStatus(data)
  
  return {
    create,
    check
  }
}
