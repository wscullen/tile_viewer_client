import '../assets/css/Sen2AgriJobManager.scss'
import '../assets/css/App.scss'

import React, { Component } from 'react'
import { connect } from 'react-redux'
import moment from 'moment'

import Sen2AgriL2APanel from './Sen2AgriL2APanel'
import Sen2AgriL3BPanel from './Sen2AgriL3BPanel'

import * as Yup from 'yup'

import {
  Button,
  Icon,
  Header,
  Label,
  Tab,
  Grid,
  Progress,
  Table,
  Modal,
  Checkbox,
  Message,
  Form,
  Popup,
  Segment,
  Dimmer,
  Loader,
} from 'semantic-ui-react'

import { AppState } from '../store/'

import {
  AreaOfInterestState,
  AreaOfInterest,
  TileList as TileListInterface,
  Session,
  CurrentDates,
  DateObject,
  ImageryDates,
} from '../store/aoi/types'

import { addAoi, updateAoi, removeAoi, updateSession } from '../store/aoi/actions'
import { TileList, ImageryListByTile } from '../store/aoi/types'
import { thunkCheckImageryStatus } from '../store/aoi/thunks'

import { JobState, Job, JobStatus } from '../store/job/types'
import { addJob, removeJob, updateJob } from '../store/job/actions'

import { thunkAddJob } from '../store/job/thunks'
import { thunkUpdateCsrfTokens } from '../store/session/thunks'

import { MainSessionState } from '../store/session/types'
import { updateMainSession, updateImageryStatusForm } from '../store/session/actions'

import { thunkSendMessage } from '../thunks'

import { TileState } from '../store/tile/types'

import {
  getAoiNames,
  getSelectedTiles,
  getHighlightedTiles,
  getAllSelectedTiles,
  getImageryListForSen2Agri,
  getImageryListByTile,
} from '../store/aoi/reducers'
import { TileListByDate } from '../store/tile/types'

interface AppProps {
  session?: MainSessionState
  selectedTiles: TileListByDate
  thunkAddJob: Function
  updateMainSession: Function
  allSelectedTiles: string[]
  aois: AreaOfInterestState
  imageryList: TileList
  imageryListByTile: ImageryListByTile
  thunkCheckImageryStatus: Function
  tiles: TileState
  jobs: JobState
  updateImageryStatusForm: Function
}

interface JobStatusVerbose {
  [key: string]: string
  C: string
  A: string
  S: string
}

interface L2AJobSettings {
  prevNDays: number
}

interface DefaultAppState {
  l2aJobSettings: L2AJobSettings
}

const defaultState: DefaultAppState = {
  l2aJobSettings: {
    prevNDays: 3,
  },
}

interface CreateL2AJobFormValues {
  prevNDays: number
}

class Sen2AgriJobManager extends Component<AppProps, AppState & DefaultAppState> {
  createL2ASchema: any

  constructor(props: AppProps) {
    super(props)

    this.state = {
      ...defaultState,
      ...this.state,
    }

    this.createL2ASchema = Yup.object().shape({
      prevNDays: Yup.number()
        .min(0, 'Previous days cannot be less than 0.')
        .max(6, 'Previous days cannot be greater than 5.')
        .required('Required.'),
    })

    console.log(`default state is ${this.state}`)
    console.log(this.state)
  }

  componentDidMount() {
    // Refresh tile status check when component mounts
    // Check for tile status using /imagerystatus thunk
    console.log('Inside sen2agri job manager component did mount')
    this.checkImageryStatus('sen2agri_l2a')
  }

  componentWillUnmount() {}

  checkImageryStatus(imageryName: string) {
    if (this.props.session.currentAoi && this.props.allSelectedTiles.length > 0) {
      let newUpdateTileStatus = {
        submitting: true,
        finished: false,
        success: false,
        msg: '',
      }

      this.props.updateImageryStatusForm(newUpdateTileStatus)

      this.props.thunkCheckImageryStatus(
        this.props.allSelectedTiles,
        imageryName,
        this.props.aois.byId[this.props.session.currentAoi].name,
      )
    }
  }

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
    console.log('Imagery List by Tile')
    console.log(this.props.imageryListByTile)

    const panes = [
      {
        menuItem: 'Atmospheric Correction',
        render: () => <Sen2AgriL2APanel />,
      },
      { menuItem: 'Cloudfree Composite', render: () => <Tab.Pane>Generate L3A cloudfree composite images.</Tab.Pane> },
      { menuItem: 'LAI and NDVI', render: () => <Sen2AgriL3BPanel /> },
    ]

    return (
      <div className="sen2agriJobManager">
        <Header as="h3">Sen2Agri Job Manager</Header>
        <Tab panes={panes} className="sen2agriTabs" />
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
  allSelectedTiles: getAllSelectedTiles(state),
  imageryList: getImageryListForSen2Agri(state),
  imageryListByTile: getImageryListByTile(state),
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
    thunkUpdateCsrfTokens,
    updateMainSession,
    thunkCheckImageryStatus,
    updateImageryStatusForm,
  },
)(Sen2AgriJobManager)
