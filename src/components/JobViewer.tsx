import '../assets/css/JobViewer.css'
import '../assets/css/App.scss'

import React, { Component, ReactElement } from 'react'
import { connect } from 'react-redux'
import moment from 'moment'

import { AppState } from '../store/'

import {
  AreaOfInterestState,
  AreaOfInterest,
  TileList as TileListInterface,
  Session,
  CurrentDates,
  DateObject,
} from '../store/aoi/types'

import { addAoi, updateAoi, removeAoi, updateSession } from '../store/aoi/actions'

import { JobState, Job, JobStatus } from '../store/job/types'
import { addJob, removeJob, updateJob } from '../store/job/actions'

import { thunkAddJob, thunkResumeCheckingJobsForAoi } from '../store/job/thunks'
import { thunkUpdateCsrfTokens } from '../store/session/thunks'

import { thunkSendMessage } from '../thunks'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

// @ts-ignore
import base64 from 'base-64'
import { ipcRenderer } from 'electron'
import { History } from 'history'

const fs = require('fs') // or directly

// To use it, simply call
const { clipboard } = require('electron')

const remote = require('electron').remote
const path = require('path')

const resourcesPath = path.join(remote.app.getPath('userData'), 'localstorage.json')

console.log('Resource path for saving local data')
console.log(resourcesPath)

import { getAoiNames, getSelectedTiles, getHighlightedTiles } from '../store/aoi/reducers'
import { MainSessionState } from '../store/session/types'
import { TileState } from '../store/tile/types'

interface AppProps {
  addAoi: typeof addAoi
  removeAoi: typeof removeAoi
  updateSession: typeof updateSession
  aois: AreaOfInterestState
  jobs: JobState
  removeJob: typeof removeJob
  session: MainSessionState
  tiles: TileState
}

interface JobObject {
  job_status: string
  job_id: string
  job_result: string
  job_assigned: string
  job_completed: string
  job_submitted: string
}

interface JobStatusVerbose {
  [key: string]: string
  C: string
  A: string
  S: string
}

interface DefaultAppState {}

const defaultState: DefaultAppState = {}

class JobViewer extends Component<AppProps, AppState & DefaultAppState> {
  constructor(props: AppProps) {
    super(props)

    this.state = {
      ...defaultState,
      ...this.state,
    }

    console.log(`default state is ${this.state}`)
    console.log(this.state)
  }

  componentDidMount() {}

  componentWillUnmount() {}

  jobSuccessIcon = (jobSuccess: boolean, jobStatus: JobStatus) => {
    if (jobSuccess && jobStatus === JobStatus.Completed) {
      return (
        <div className="verified">
          <FontAwesomeIcon icon={'check'} />
        </div>
      )
    } else if (!jobSuccess && jobStatus === JobStatus.Completed) {
      return (
        <div className="notVerified">
          <FontAwesomeIcon icon={'times'} />
        </div>
      )
    }
  }

  render() {
    let jobIds: string[] = []
    if (this.props.jobs.byAoiId.hasOwnProperty(this.props.session.currentAoi)) {
      jobIds = [...this.props.jobs.byAoiId[this.props.session.currentAoi]]
      jobIds = jobIds.reverse()
    } else {
      jobIds = []
    }

    return (
      <div className="jobViewerTable">
        <table className="table">
          <thead>
            <tr>
              <th>Job ID</th>
              <th>Type</th>
              <th>Tile Name</th>
              <th>Status</th>
              <th>Submitted</th>
              <th>Assigned</th>
              <th>Completed</th>
              <th>Success</th>
              <th>Controls</th>
            </tr>
          </thead>
          <tfoot>
            <tr>
              <th>Job ID</th>
              <th>Type</th>
              <th>Tile Name</th>
              <th>Status</th>
              <th>Submitted</th>
              <th>Assigned</th>
              <th>Completed</th>
              <th>Success</th>
              <th>Controls</th>
            </tr>
          </tfoot>
          <tbody>
            {jobIds.map(id => {
              const job: Job = this.props.jobs.byId[id]
              let jobType: string = ''
              let displayName: string = ''

              if (job.hasOwnProperty('tileId')) {
                jobType = 'Tile'
                const tileName = this.props.tiles.byId[job.tileId].properties.name
                const tileNameParts = tileName.split('_')
                displayName = `${tileNameParts[0]}_${tileNameParts[1].slice(3)}_${tileNameParts[5].slice(1)}_${
                  tileNameParts[2]
                }_${tileNameParts[6]}`
              } else {
                jobType = 'Aoi'
                displayName = 'na'
              }
              console.log(job)
              return (
                <tr key={job.id}>
                  <th>
                    <abbr title={job.id}>{job.id.slice(0, 8)}</abbr>
                  </th>
                  <td>{jobType}</td>
                  <td>
                    <abbr title={displayName}>{displayName.slice(8, 22)}</abbr>
                  </td>
                  <td>{JobStatus[job.status]}</td>
                  <td>{job.submittedDate !== '' ? moment(job.submittedDate).format('MMM DD YYYY - HH:mm:ss') : ''}</td>
                  <td>{job.assignedDate !== '' ? moment(job.assignedDate).format('MMM DD YYYY - HH:mm:ss') : ''}</td>
                  <td>{job.completedDate !== '' ? moment(job.completedDate).format('MMM DD YYYY - HH:mm:ss') : ''}</td>
                  <td>{this.jobSuccessIcon(job.success, job.status)}</td>
                  <td>
                    <button
                      className="tileActionButton removeAction"
                      onClick={event => {
                        console.log('trying to remove job, inside tile list')
                        this.props.removeJob(job.id)
                        event.stopPropagation()
                      }}
                    >
                      <FontAwesomeIcon icon="times-circle" />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    )
  }
}

const mapStateToProps = (state: AppState) => ({
  tiles: state.tile,
  aois: state.aoi,
  session: state.session,
  jobs: state.job,
  aoiNames: getAoiNames(state.aoi),
  selectedTiles: getSelectedTiles(state),
  highlightedTiles: getHighlightedTiles(state),
})

export default connect(
  mapStateToProps,
  {
    addAoi,
    removeAoi,
    updateSession,
    addJob,
    updateJob,
    removeJob,
    thunkSendMessage,
    thunkAddJob,
    thunkResumeCheckingJobsForAoi,
    thunkUpdateCsrfTokens,
  },
)(JobViewer)
