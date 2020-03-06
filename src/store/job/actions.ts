import { Job, ADD_JOB, ADD_JOBS, REMOVE_JOB, UPDATE_JOB, UPDATE_JOBS, JobActionTypes } from './types'

export function addJob(newJob: Job): JobActionTypes {
  return {
    type: ADD_JOB,
    payload: newJob,
  }
}

export function addJobs(newJobs: Job[]): JobActionTypes {
  return {
    type: ADD_JOBS,
    payload: newJobs,
  }
}

export function updateJobs(jobsToUpdate: Job[]): JobActionTypes {
  return {
    type: UPDATE_JOBS,
    payload: jobsToUpdate,
  }
}

export function removeJob(jobId: string): JobActionTypes {
  return {
    type: REMOVE_JOB,
    payload: jobId,
  }
}

export function updateJob(job: Job): JobActionTypes {
  return {
    type: UPDATE_JOB,
    payload: job,
  }
}
