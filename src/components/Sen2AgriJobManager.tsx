import '../assets/css/Sen2AgriJobManager.scss'
import '../assets/css/App.scss'

import React, { Component } from 'react'
import { connect } from 'react-redux'
import moment from 'moment'

import { Icon, Header, Tab } from 'semantic-ui-react'

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

import { getAoiNames, getSelectedTiles, getHighlightedTiles } from '../store/aoi/reducers'

interface AppProps {}

interface JobStatusVerbose {
  [key: string]: string
  C: string
  A: string
  S: string
}

interface DefaultAppState {}

const defaultState: DefaultAppState = {}

class Sen2AgriJobManager extends Component<AppProps, AppState & DefaultAppState> {
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
          <Icon name={'check'} />
        </div>
      )
    } else if (!jobSuccess && jobStatus === JobStatus.Completed) {
      return (
        <div className="notVerified">
          <Icon name={'times'} />
        </div>
      )
    }
  }

  render() {
    const panes = [
      {
        menuItem: 'Atmospheric Correction',
        render: () => <Tab.Pane>Generate L2A Products Compatible with other Sen2Agri Processors.</Tab.Pane>,
      },
      { menuItem: 'Cloudfree Composite', render: () => <Tab.Pane>Generate L3A cloudfree composite images.</Tab.Pane> },
      { menuItem: 'LAI and NDVI', render: () => <Tab.Pane>Generate L3B LAI and NDVI products.</Tab.Pane> },
    ]

    return (
      <div className="sen2agriJobManager">
        <Header size="medium">Sen2Agri Job Manager</Header>
        <Tab panes={panes} />
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
)(Sen2AgriJobManager)
