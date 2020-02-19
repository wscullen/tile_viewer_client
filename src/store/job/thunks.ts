import { Action } from 'redux'
import { ThunkAction } from 'redux-thunk'
import { addJob } from './actions'
import { updateTile } from '../tile/actions'
import { updateJob, removeJob } from './actions'
import { Job, JobStatus } from './types'
import { AppState } from '../index'
import { Tile, TileListByDate } from '../tile/types'

import { AreaOfInterest } from '../aoi/types'
import { updateAoi } from '../aoi/actions'
import { tsImportEqualsDeclaration } from '@babel/types'

import { refreshToken } from '../session/thunks'

import { updateMainSession } from '../session/actions'

//@ts-ignore
import base64 from 'base-64'

const checkJobStatus = (
  jobId: string,
  jobManagerUrl: string,
  csrfToken: string,
  getState: any,
  dispatch: any,
): void => {
  const headers = new Headers()

  // @ts-ignore
  headers.append('X-CSRFToken', csrfToken)
  headers.append('Content-Type', 'application/json')
  // headers.append('Authorization', `Basic ${base64.encode(`${JOBMANAGER_USERNAME}:${JOBMANAGER_PASSWORD}`)}`)

  // @ts-ignore

  console.log(jobId)
  console.log(`CHECKING JOB STATUS FOR ID: ${jobId}`)

  if (jobId) {
    fetch(`${jobManagerUrl}/jobs/${jobId}`, {
      method: 'GET',
      headers,
    })
      .then(response => {
        if (response.status === 200) {
          return response.json()
        } else if (response.status === 404) {
          console.log('problem fetching job status, removing job')
          const state = getState()
          const job = { ...state.job.byId[jobId] }

          clearInterval(job.setIntervalId)

          dispatch(removeJob(jobId))

          throw new Error('job not found on the job manager, removing from local app storage')
        }
      })
      .then(response => {
        console.log('Success:', JSON.stringify(response))
        // Success: {"url":"http://localhost:9090/jobs/7b34635e-7d4b-45fc-840a-8c9de3251abc/","id":"7b34635e-7d4b-45fc-840a-8c9de3251abc","submitted":"2019-05-09T21:49:36.023959Z","label":"S2Download L1C_T12UUA_A015468_20180608T183731","command":"not used","job_type":"S2Download","parameters":{"options":{"tile":"L1C_T12UUA_A015468_20180608T183731","ac":true,"ac_res":10}},"priority":"3","owner":"backup"}
        // Todo update each tile with job info (id, status, success, workerid)

        console.log('found job on job manager, updating status')
        const state = getState()
        const job = { ...state.job.byId[jobId] }
        console.log('job from server......................................................')
        console.log(response)

        interface Status {
          [index: string]: number
          S: number
          A: number
          C: number
        }

        const statusObject: Status = {
          S: 0,
          A: 1,
          C: 2,
        }

        console.log(job)

        console.log(response.status)

        job.status = statusObject[response.status]
        console.log(job.status)

        if (job.status === JobStatus.Assigned) {
          job.assignedDate = response.assigned
          console.log('status is assigned')
          dispatch(updateJob(job))
        }

        if (job.status === JobStatus.Completed) {
          job.assignedDate = response.assigned
          job.completedDate = response.completed
          job.success = response.success
          job.resultMessage = response.result_message

          console.log('status is completed')
          clearInterval(job.setIntervalId)
          dispatch(updateJob(job))
        }

        console.log(job)
        console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
        //     assigned: null
        // command: "not used"
        // completed: null
        // id: "7cbfe8e3-eefa-4de2-b961-bb5de8345b01"
        // job_type: "S2Download"
        // label: "S2Download L1C_T13UER_A020587_20190601T175659"
        // owner: "http://localhost:8090/users/2/"
        // parameters: {options: {…}}
        // priority: "3"
        // result_message: null
        // status: "S"
        // submitted: "2019-08-15T01:20:05.308952Z"
        // success: false
        // url: "http://localhost:8090/jobs/7cbfe8e3-eefa-4de2-b961-bb5de8345b01/"
        // worker_id: null

        // job.submittedDate = response.submitted

        // job.checkedCount = 0
      })
      .catch(err => {
        console.log(err)
        console.log('something went wrong when trying to check the job')
      })
  }
}

const getJobs = async (
  jobIdList: string[],
  jobManagerUrl: string,
  csrfToken: string,
  accessToken: string,
): Promise<any> => {
  const headers = new Headers()
  headers.append('X-CSRFToken', csrfToken)
  headers.append('Content-Type', 'application/json')
  headers.append('Authorization', `Bearer ${accessToken}`)

  const data = {
    job_id_list: jobIdList,
  }

  const searchParams = new URLSearchParams({
    job_ids: jobIdList.join(),
  })

  return fetch(`${jobManagerUrl}/jobs/?${searchParams}`, {
    method: 'GET',
    headers,
  })
    .then(response => {
      if (response.status === 200) {
        return response.json()
      } else if (response.status === 404) {
        console.log('problem fetching jobs status, removing job')

        throw new Error('no jobs found on job manager!')
      }
    })
    .then(response => {
      console.log('Success:', JSON.stringify(response))
      // Success: {"url":"http://localhost:9090/jobs/7b34635e-7d4b-45fc-840a-8c9de3251abc/","id":"7b34635e-7d4b-45fc-840a-8c9de3251abc","submitted":"2019-05-09T21:49:36.023959Z","label":"S2Download L1C_T12UUA_A015468_20180608T183731","command":"not used","job_type":"S2Download","parameters":{"options":{"tile":"L1C_T12UUA_A015468_20180608T183731","ac":true,"ac_res":10}},"priority":"3","owner":"backup"}
      // Todo update each tile with job info (id, status, success, workerid)

      console.log(response)

      return response
    })
    .catch(err => {
      console.log(err)
      console.log('something went wrong when trying to check the job')
    })
}

export const thunkCheckJobsForAoi = (aoiId: string): ThunkAction<void, AppState, null, Action<string>> => async (
  dispatch: any,
  getState: any,
) => {
  console.log('Lets get thunky!!!')

  const state = getState()
  if (state.job.byAoiId.hasOwnProperty(aoiId)) {
    const jobsForAoi = [...state.job.byAoiId[aoiId]]

    const jobManagerUrl: string = state.session.settings.jobManagerUrl
    const csrfToken: string = state.session.csrfTokens.jobManager.key
    const accessToken: string = state.session.settings.auth.accessToken
    const jobIdList = []

    for (const jobId of jobsForAoi) {
      const job = { ...state.job.byId[jobId] }
      console.log(`job id ${jobId}`)
      console.log(job.status)
      console.log(JobStatus.Completed)
      if (job && job.status !== JobStatus.Completed) {
        jobIdList.push(job.id)
      }
    }
    if (jobIdList.length > 0) {
      const jobs = await getJobs(jobIdList, jobManagerUrl, csrfToken, accessToken)
      for (const job of jobs) {
        const jobToUpdate = { ...state.job.byId[job.id] }

        interface Status {
          [index: string]: number
          S: number
          A: number
          C: number
        }

        const statusObject: Status = {
          S: 0,
          A: 1,
          C: 2,
        }

        // convert the response letter into a number that our Enum can work with
        job.status = statusObject[job.status]

        if (job.status === JobStatus.Assigned && jobToUpdate.status === JobStatus.Submitted) {
          jobToUpdate.assignedDate = job.assigned
          jobToUpdate.status = job.status
          dispatch(updateJob(jobToUpdate))
        }

        if (job.status === JobStatus.Completed) {
          jobToUpdate.assignedDate = job.assigned
          jobToUpdate.completedDate = job.completed
          jobToUpdate.status = job.status
          jobToUpdate.success = job.success
          jobToUpdate.resultMessage = job.result_message

          console.log('status is completed')
          dispatch(updateJob(jobToUpdate))
        }
      }
    } else {
      console.log('No jobs to check for Aoi.')
    }
  }
}

export const thunkAddJob = (newJob: Job): ThunkAction<void, AppState, null, Action<string>> => async (
  dispatch: any,
  getState: any,
) => {
  console.log('thunk started in func')
  const state = getState()

  const jobManagerUrl: string = state.session.settings.jobManagerUrl
  const atmosCorrection: boolean = state.aoi.byId[newJob.aoiId].session.settings.atmosphericCorrection

  console.log(atmosCorrection)

  const csrfToken: string = state.session.csrfTokens.jobManager.key

  await refreshToken(state.session, dispatch)

  // const activeAoiName = state.aoi.byId[newJob.aoiId]

  if (newJob.type === 'tile') {
    let tile: Tile
    tile = { ...state.tile.byId[newJob.tileId] }
    const accessToken: string = state.session.settings.auth.accessToken
    const jobResult = await submitJobToApi(jobManagerUrl, newJob, tile, atmosCorrection, csrfToken, accessToken)

    if (jobResult) {
      console.log('thunk finished in func job submitted successfully')
      const aoi = { ...state.aoi.byId[state.session.currentAoi] }

      aoi.jobs.push(jobResult.id)
      tile.jobs.push(jobResult.id)

      dispatch(addJob(newJob))
      dispatch(updateTile(tile))
      dispatch(updateAoi(aoi))
    }
  } else if (newJob.type === 'Sen2Agri_L2A') {
    console.log(newJob)
    const accessToken: string = state.session.settings.auth.accessToken
    // newJob.params['aoiName'] = activeAoiName
    const jobResult = await submitSen2AgriJobToApi(
      jobManagerUrl,
      newJob,
      newJob.tileDict,
      newJob.params,
      csrfToken,
      accessToken,
    )
    if (jobResult.errorResult) {
      console.log('something went terribly wrong while submitting job')
      let newL2AFormState = {
        submitting: false,
        finished: true,
        success: false,
        msg: `Something went wrong while trying to submit the job (${jobResult.errorResult})`,
      }

      let mainSession = state.session

      mainSession.forms.createL2AJob = newL2AFormState

      dispatch(updateMainSession(mainSession))
    } else if (jobResult) {
      console.log('thunk finished in func')
      const aoi = { ...state.aoi.byId[state.session.currentAoi] }
      aoi.jobs.push(jobResult.id)

      let newL2AFormState = {
        submitting: false,
        finished: true,
        success: true,
        msg: 'Successfully submitted job.',
      }

      let mainSession = state.session

      mainSession.forms.createL2AJob = newL2AFormState

      dispatch(updateMainSession(mainSession))

      dispatch(addJob(newJob))
      dispatch(updateAoi(aoi))
    }
  }
}

const submitJobToApi = async (
  jobManagerUrl: string,
  job: Job,
  tile: Tile,
  atmosCorrection: boolean,
  csrfToken: string,
  accessToken: string,
): Promise<Job> => {
  console.log(jobManagerUrl)
  console.log(job)
  console.log(tile)

  let jobType: string

  let options: any

  switch (tile.properties.platformName) {
    case 'Sentinel-2':
      jobType = 'S2Download'
      options = {
        tile: tile.properties.name,
        ac: atmosCorrection,
        ac_res: 10,
        entity_id: tile.properties.entityId,
        api_source: tile.properties.apiSource,
      }
      break
    case 'Landsat-8':
      jobType = 'L8Download'
      options = {
        tile: tile.properties.name,
        ac: atmosCorrection,
        entity_id: tile.properties.entityId,
        api_source: tile.properties.apiSource,
      }
      break
  }

  const jobReqBody = {
    label: `${jobType} ${tile.properties.name}`,
    command: 'not used',
    job_type: jobType,
    parameters: {
      options,
    },
    priority: '3',
  }

  const headers = new Headers()

  // @ts-ignore
  headers.append('X-CSRFToken', csrfToken)
  headers.append('Content-Type', 'application/json')
  headers.append('Authorization', `Bearer ${accessToken}`)

  // @ts-ignore

  return fetch(`${jobManagerUrl}/jobs/`, {
    method: 'POST',
    body: JSON.stringify(jobReqBody),
    headers,
  })
    .then(response => {
      console.log(response)
      if (response.status === 201) {
        return response.json()
      } else {
        return undefined
      }
    })
    .then(response => {
      console.log(response)
      console.log('Success:', JSON.stringify(response))
      // Success: {"url":"http://localhost:9090/jobs/7b34635e-7d4b-45fc-840a-8c9de3251abc/","id":"7b34635e-7d4b-45fc-840a-8c9de3251abc","submitted":"2019-05-09T21:49:36.023959Z","label":"S2Download L1C_T12UUA_A015468_20180608T183731","command":"not used","job_type":"S2Download","parameters":{"options":{"tile":"L1C_T12UUA_A015468_20180608T183731","ac":true,"ac_res":10}},"priority":"3","owner":"backup"}
      // Todo update each tile with job info (id, status, success, workerid)

      job.id = response.id

      job.status = JobStatus.Submitted

      job.submittedDate = response.submitted

      job.checkedCount = 0

      return job
    })
    .catch(err => {
      console.log(err)
      console.log('something went wrong when trying to submit the job')
    })
}

const submitSen2AgriJobToApi = (
  jobManagerUrl: string,
  job: Job,
  tileDict: TileListByDate,
  parameters: any,
  csrfToken: string,
  accessToken: string,
): Promise<Job> => {
  console.log(jobManagerUrl)
  console.log(job)
  console.log(tileDict)

  let jobType: string
  let options: any

  switch (job.type) {
    case 'Sen2Agri_L2A':
      jobType = 'Sen2Agri_L2A'
      options = {
        aoi_name: parameters.l2a.activeAoiName,
        window_size: parameters.l2a.prevNDays,
        imagery_list: parameters.l2a.imageryList,
      }
      break
  }

  console.log(options)

  const jobReqBody = {
    label: `${jobType} ${parameters.l2a.activeAoiName}`,
    command: 'not used',
    job_type: jobType,
    parameters: {
      options,
    },
    priority: '3',
  }

  const headers = new Headers()
  headers.append('X-CSRFToken', csrfToken)
  headers.append('Content-Type', 'application/json')
  headers.append('Authorization', `Bearer ${accessToken}`)

  return fetch(`${jobManagerUrl}/jobs/`, {
    method: 'POST',
    body: JSON.stringify(jobReqBody),
    headers,
  })
    .then(response => {
      console.log(response)
      if (response.status === 201) {
        return response.json()
      } else {
        return undefined
      }
    })
    .then(
      (response): Job => {
        console.log(response)
        console.log('Success:', JSON.stringify(response))

        // Success: {"url":"http://localhost:9090/jobs/7b34635e-7d4b-45fc-840a-8c9de3251abc/","id":"7b34635e-7d4b-45fc-840a-8c9de3251abc","submitted":"2019-05-09T21:49:36.023959Z","label":"S2Download L1C_T12UUA_A015468_20180608T183731","command":"not used","job_type":"S2Download","parameters":{"options":{"tile":"L1C_T12UUA_A015468_20180608T183731","ac":true,"ac_res":10}},"priority":"3","owner":"backup"}
        // Todo update each tile with job info (id, status, success, workerid)

        job.id = response.id

        job.status = JobStatus.Submitted

        job.submittedDate = response.submitted

        job.checkedCount = 0

        return job
      },
    )
    .catch(err => {
      console.log(err)
      console.log('something went wrong when trying to submit the job')
      job.errorResult = err
      return job
    })
}
