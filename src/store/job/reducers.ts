import { JobState, ADD_JOB, REMOVE_JOB, UPDATE_JOB, JobActionTypes } from './types'

import { AppState } from '../index'

const initialState: JobState = {
  byId: {},
  allIds: [],
  byAoiId: {},
}

export function jobReducer(state = initialState, action: JobActionTypes): JobState {
  switch (action.type) {
    case ADD_JOB: {
      const jobs = { ...state }
      jobs.byId[action.payload.id] = { ...action.payload }
      jobs.allIds.push(action.payload.id)

      if (jobs.byAoiId[action.payload.aoiId]) {
        jobs.byAoiId[action.payload.aoiId].push(action.payload.id)
      } else {
        jobs.byAoiId[action.payload.aoiId] = []
        jobs.byAoiId[action.payload.aoiId].push(action.payload.id)
      }

      return {
        ...jobs,
      }
    }
    case UPDATE_JOB: {
      const jobs = { ...state }
      const jobToUpdate = jobs.byId[action.payload.id]

      const newJob = Object.assign(
        {},
        action.payload,
      )

      jobs.byId[action.payload.id] = newJob

      return {
        ...jobs,
      }
    }
    case REMOVE_JOB: {
      console.log(action.payload)
      const jobs = { ...state }

      const jobToDelete = jobs.byId[action.payload]
      const aoiId = jobToDelete.aoiId

      delete jobs.byId[action.payload]
      jobs.allIds.splice(jobs.allIds.indexOf(action.payload), 1)

      jobs.byAoiId[aoiId].splice(jobs.byAoiId[aoiId].indexOf(action.payload), 1)

      return {
        ...jobs,
      }
    }
    default:
      return state
  }
}
