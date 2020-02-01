import '../assets/css/JobViewer.scss'
import '../assets/css/App.scss'

import React, { Component } from 'react'
import { connect } from 'react-redux'
import moment from 'moment'

import { Icon, Button, Table, Menu, Label } from 'semantic-ui-react'

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
import { MainSessionState, JobNavigationTabs } from '../store/session/types'
import { TileState } from '../store/tile/types'

import Sen2AgriJobManager from './Sen2AgriJobManager'

interface AppProps {
  addAoi: typeof addAoi
  removeAoi: typeof removeAoi
  updateSession: typeof updateSession
  aois: AreaOfInterestState
  jobs: JobState
  removeJob: typeof removeJob
  session: MainSessionState
  tiles: TileState
  activeTab: JobNavigationTabs
  handleTabChange: Function
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

  navigationPanel = () => {
    return (
      <Button.Group basic size="big" className="jobsMainMenu">
        <Button
          active={this.props.activeTab === 0}
          id="0"
          onClick={e => {
            this.props.handleTabChange(e)
          }}
        >
          All Jobs
        </Button>
        <Button
          active={this.props.activeTab === 1}
          id="1"
          onClick={e => {
            this.props.handleTabChange(e)
          }}
        >
          Sen2Agri
        </Button>
      </Button.Group>
    )
  }

  render() {
    let jobIds: string[] = []
    if (this.props.jobs.byAoiId.hasOwnProperty(this.props.session.currentAoi)) {
      jobIds = [...this.props.jobs.byAoiId[this.props.session.currentAoi]]
      jobIds = jobIds.reverse()
    } else {
      jobIds = []
    }

    if (this.props.activeTab === 0) {
      return (
        <div>
          {this.navigationPanel()}
          <div className="jobViewerTable">
            <Table celled>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Job ID</Table.HeaderCell>
                  <Table.HeaderCell>Type</Table.HeaderCell>
                  <Table.HeaderCell>Tile Name</Table.HeaderCell>
                  <Table.HeaderCell>Status</Table.HeaderCell>
                  <Table.HeaderCell>Submitted</Table.HeaderCell>
                  <Table.HeaderCell>Assigned</Table.HeaderCell>
                  <Table.HeaderCell>Completed</Table.HeaderCell>
                  <Table.HeaderCell>Success</Table.HeaderCell>
                  <Table.HeaderCell>Controls</Table.HeaderCell>
                </Table.Row>
              </Table.Header>

              <Table.Body>
                {jobIds.map(id => {
                  const job: Job = this.props.jobs.byId[id]
                  if (job) {
                    let jobType: string = ''
                    let displayName: string = ''
                    let abreviatedDisplayName: string = ''

                    if (job.hasOwnProperty('tileId')) {
                      jobType = 'Tile'
                      const tileName = this.props.tiles.byId[job.tileId].properties.name
                      const tileNameParts = tileName.split('_')

                      if (tileName.startsWith('S2')) {
                        displayName = `${tileNameParts[0]}_${tileNameParts[1].slice(3)}_${tileNameParts[5].slice(1)}_${
                          tileNameParts[2]
                        }_${tileNameParts[6]}`

                        abreviatedDisplayName = displayName.slice(8, 22)
                      } else if (tileName.startsWith('LC08')) {
                        displayName = tileName
                        abreviatedDisplayName = displayName.slice(10, 25)
                      }
                    } else {
                      jobType = 'Aoi'
                      displayName = 'na'
                    }
                    console.log(job)
                    return (
                      <Table.Row key={job.id}>
                        <Table.Cell>
                          <abbr title={job.id}>{job.id.slice(0, 8)}</abbr>
                        </Table.Cell>
                        <Table.Cell>{jobType}</Table.Cell>
                        <Table.Cell>
                          <abbr title={displayName}>{abreviatedDisplayName}</abbr>
                        </Table.Cell>
                        <Table.Cell>{JobStatus[job.status]}</Table.Cell>
                        <Table.Cell>
                          {job.submittedDate !== '' ? moment(job.submittedDate).format('MMM DD YYYY - HH:mm:ss') : ''}
                        </Table.Cell>
                        <Table.Cell>
                          {job.assignedDate !== '' ? moment(job.assignedDate).format('MMM DD YYYY - HH:mm:ss') : ''}
                        </Table.Cell>
                        <Table.Cell>
                          {job.completedDate !== '' ? moment(job.completedDate).format('MMM DD YYYY - HH:mm:ss') : ''}
                        </Table.Cell>
                        <Table.Cell>{this.jobSuccessIcon(job.success, job.status)}</Table.Cell>
                        <Table.Cell>
                          <Button
                            className="tileActionButton removeAction"
                            onClick={event => {
                              console.log('trying to remove job, inside tile list')
                              this.props.removeJob(job.id)
                              event.stopPropagation()
                            }}
                            icon="times circle"
                            basic
                            compact
                            size="mini"
                          />
                        </Table.Cell>
                      </Table.Row>
                    )
                  }
                })}
              </Table.Body>

              <Table.Footer>
                <Table.Row>
                  <Table.HeaderCell>Job ID</Table.HeaderCell>
                  <Table.HeaderCell>Type</Table.HeaderCell>
                  <Table.HeaderCell>Tile Name</Table.HeaderCell>
                  <Table.HeaderCell>Status</Table.HeaderCell>
                  <Table.HeaderCell>Submitted</Table.HeaderCell>
                  <Table.HeaderCell>Assigned</Table.HeaderCell>
                  <Table.HeaderCell>Completed</Table.HeaderCell>
                  <Table.HeaderCell>Success</Table.HeaderCell>
                  <Table.HeaderCell>Controls</Table.HeaderCell>
                </Table.Row>
                <Table.Row>
                  <Table.HeaderCell colSpan="9">
                    <Menu floated="right" pagination>
                      <Menu.Item as="a" icon>
                        <Icon name="chevron left" />
                      </Menu.Item>
                      <Menu.Item as="a">1</Menu.Item>
                      <Menu.Item as="a" icon>
                        <Icon name="chevron right" />
                      </Menu.Item>
                    </Menu>
                  </Table.HeaderCell>
                </Table.Row>
              </Table.Footer>
            </Table>
          </div>
        </div>
      )
    } else if (this.props.activeTab === 1) {
      return (
        <div className="jobViewer">
          {this.navigationPanel()}
          <Sen2AgriJobManager />
        </div>
      )
    }
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
