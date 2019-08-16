import { Job, ADD_JOB, REMOVE_JOB, UPDATE_JOB, JobActionTypes } from './types'

export function addJob(newJob: Job): JobActionTypes {
  return {
    type: ADD_JOB,
    payload: newJob,
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
