import { JobState, ADD_JOB, REMOVE_JOB, UPDATE_JOB, JobActionTypes } from './types'

import { AppState } from '../index'

const initialState: JobState = {
  byId: {},
  allIds: [],
  byAoiId: {},
}

export function checkJobStatus(state: AppState, jobId: string, tileId: string): string[] {
  // const jobStatusVerbose = {
  //   C: 'completed',
  //   A: 'assigned',
  //   S: 'submitted',
  // }

  // console.log('Checking job status-----------------------------------------------------------')
  // console.log(jobId, tileId)
  // // @ts-ignore
  // const tiles = this.state.selectedTiles
  // // @ts-ignore

  // if (this.state.job_csrf_token === null) {
  //   this.getCSRFToken(this.checkJobStatus, 'job_manager', [job_id, tile_name, date])
  // } else {
  //   const currentTile = tiles[date].find((ele: any) => ele.properties.name == tile_name)

  //   const headers = new Headers()
  //   // @ts-ignore
  //   headers.append('X-CSRFToken', this.state.job_csrf_token)
  //   headers.append('Content-Type', 'application/json')
  //   headers.append('Authorization', `Basic ${base64.encode(`${'backup'}:${'12341234'}`)}`)

  //   // @ts-ignore
  //   fetch(`${this.props.settings.job_url}/jobs/${job_id}/`, {
  //     method: 'GET',
  //     headers,
  //   })
  //     .then(response => response.json())
  //     .then(response => {
  //       console.log('Success:', JSON.stringify(response))
  //       console.log(currentTile)
  //       console.log(response)

  //       currentTile.job_id = response.id
  //       currentTile.job_result = response.success ? 'success' : 'failed'

  //       // @ts-ignore
  //       currentTile.job_status = jobStatusVerbose[response.status]
  //       currentTile.job_assigned = response.assigned
  //       currentTile.job_completed = response.completed
  //       currentTile.job_submitted = response.submitted
  //       currentTile.job_result_message = response.result_message
  //       currentTile.times_checked += 1

  //       console.log(currentTile.job_status)
  //       let allJobsDone = false

  //       if (currentTile.job_status === 'completed') {
  //         console.log('clearing the job status check')
  //         clearInterval(currentTile.job_check_interval)
  //         allJobsDone = true

  //         Object.keys(tiles).map(ele => {
  //           if (tiles[ele].length > 0) {
  //             tiles[ele].map((t: any) => {
  //               // @ts-ignore

  //               if (t['job_status'] !== jobStatusVerbose[response['status']] && t['job_result'] !== 'success') {
  //                 allJobsDone = false
  //               }
  //             })
  //           }
  //         })
  //       }

  //       this.setState({
  //         // @ts-ignore
  //         selectedTiles: tiles,
  //         enableSen2AgriL2A: allJobsDone,
  //       })
  //     })
  //     .catch(err => {
  //       console.log(err)
  //       console.log('something went wrong when trying to check the job')
  //     })
  // }

  return []
}

export function jobReducer(state = initialState, action: JobActionTypes): JobState {
  switch (action.type) {
    case ADD_JOB: {
      const jobs = { ...state }
      jobs.byId[action.payload.id] = action.payload
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

      const newJob = {
        ...jobToUpdate,
        ...action.payload,
      }

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
