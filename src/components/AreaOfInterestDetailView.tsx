import '../assets/css/AreaOfInterestDetailView.css'
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

class AreaOfInterestDetailView extends Component<AppProps, AppState & DefaultAppState> {
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

  render() {
    let aoi: AreaOfInterest = undefined
    if (this.props.session.currentAoi !== '') {
      aoi = { ...this.props.aois.byId[this.props.session.currentAoi] }
    }

    console.log(aoi)

    return (
      <div className="aoiDetailView">
        <h4>Name:</h4>
        <p>{aoi ? aoi.name : ''}</p>
        <h4>Created:</h4>
        <p>{aoi ? moment(aoi.dateCreated).format('MMMM DD YYYY - HH:mm') : ''}</p>
        <h4>Contraint Info:</h4>
        <h5>Season Start:</h5>
        <p>{aoi ? moment(aoi.startDate).format('MMMM DD YYYY') : ''}</p>
        <h5>Season End:</h5>
        <p>{aoi ? moment(aoi.endDate).format('MMMM DD YYYY') : ''}</p>
        <h5>Sensors:</h5>
        <ul>
          {aoi
            ? aoi.sensorList.map(sensor => {
                return <li key={'key' + sensor}>{sensor}</li>
              })
            : ''}
        </ul>
        <h5>WKT Area of Interest Extent:</h5>
        <p>{aoi ? aoi.wktFootprint : ''}</p>
        <h5>MGRS Grid Extent:</h5>
        <ul>
          {aoi
            ? aoi.mgrsList.map(grid => {
                return <li key={'key' + grid}>{grid}</li>
              })
            : ''}
        </ul>
        <h5>WRS Grid Extent:</h5>
        <ul>
          {aoi
            ? aoi.wrsList.map(grid => {
                return <li key={'key' + grid}>{grid}</li>
              })
            : ''}
        </ul>
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
)(AreaOfInterestDetailView)
