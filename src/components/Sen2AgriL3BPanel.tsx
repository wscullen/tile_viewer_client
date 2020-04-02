import '../assets/css/Sen2AgriL2APanel.scss'

import React, { Component } from 'react'
import { connect } from 'react-redux'
import moment from 'moment'

import * as Yup from 'yup'

import {
  Button,
  Icon,
  Header,
  Label,
  Tab,
  Progress,
  Table,
  Modal,
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

import { Formik, Form as FormikForm, Field as FormikField } from 'formik'

import {
  getAoiNames,
  getSelectedTiles,
  getHighlightedTiles,
  getAllSelectedTiles,
  getImageryListForSen2Agri,
  getImageryListByTile,
} from '../store/aoi/reducers'
import { TileListByDate } from '../store/tile/types'

import Slider from './Slider'

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

class Sen2AgriL2APanel extends Component<AppProps, AppState & DefaultAppState> {
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
    const imageryListByTile = this.props.imageryListByTile.sentinel2
    console.log(`imagery list by tile structure`)
    console.log(imageryListByTile)
    // Need to create a obj with the dates as keys and a list of tiles for each date
    const datesForEachTile: any = {}

    Object.keys(imageryListByTile).map(key => {
      datesForEachTile[key] = Object.keys(imageryListByTile[key])
    })

    const tiles = Object.keys(datesForEachTile)
    let recentJob: Job = undefined
    let previousJobs: Job[]
    let overallProgressPercent: number = 0

    if (this.props.session.currentAoi) {
      const allJobsForAoi = this.props.jobs.byAoiId.hasOwnProperty(this.props.session.currentAoi)
        ? this.props.jobs.byAoiId[this.props.session.currentAoi]
        : []
      const aoiJobs = allJobsForAoi.filter((jobId: string): string => {
        const job = this.props.jobs.byId[jobId]
        if (job.type === 'Sen2Agri_L3B') {
          return jobId
        }
      })
      recentJob = this.props.jobs.byId[aoiJobs[aoiJobs.length - 1]]

      let overallProgress = 0
      let overallTotal = 0

      if (
        recentJob &&
        recentJob.hasOwnProperty('progressInfo') &&
        recentJob.progressInfo.hasOwnProperty('task_progress')
      ) {
        Object.entries(recentJob.progressInfo.task_progress).map(([key, value]) => {
          console.log(`KEY: ${key}`)
          let progressItem = value.progress
          // Find the tile, then find the dates length for that tile
          let tile = recentJob.progressInfo.task_ids.find(item => {
            if (item[1] === key) return item
          })[0]
          console.log(imageryListByTile)
          let datesCountForTile = Object.keys(imageryListByTile[tile]).length

          console.log(tile)
          console.log(datesCountForTile)

          if (progressItem) {
            overallProgress += progressItem.dates_completed // TODO: Change on sen2agri task and here to just progress
            overallTotal += progressItem.dates_total
          } else {
            overallTotal += datesCountForTile
          }
          console.log(overallProgress)
          console.log(overallTotal)
        })
      }

      overallProgressPercent = (overallProgress / overallTotal) * 100

      previousJobs = aoiJobs
        .slice(0, -1)
        .map(jobId => {
          return this.props.jobs.byId[jobId]
        })
        .sort((a, b) => {
          if (a.submittedDate > b.submittedDate) return 0
          else return 1
        })
    }

    const allDates: string[] = []

    for (let value of Object.values(this.props.imageryListByTile.sentinel2)) {
      for (let v of Object.keys(value)) {
        console.log(v)
        allDates.push(v)
      }
    }

    // Disable scrolling of tile table if tile status is being updated
    let tileTableClass = 'imageryStatusTable'
    if (this.props.session.forms.updateTileStatus.submitting) {
      tileTableClass += ' noScroll'
    }
    // Get all dates set
    let dates = new Set(allDates)

    const domain = [0, 3]
    const sliderStyle = {
      position: 'relative' as 'relative',
      top: '10px',
      width: '40%',
      height: '40px',
      margin: '0px 20px',
    }

    const railStyle = {
      position: 'absolute' as 'absolute',
      borderRadius: '4px',
      backgroundColor: 'rgba(0, 0, 0, 0.05)',
      width: '100%',
      height: '0.4em',
      top: '0.55em',
      left: 0,
      zIndex: 1,
    }
    const initialValues: CreateL2AJobFormValues = {
      prevNDays: 3,
    }

    const jobStatusVerbose: JobStatusVerbose = {
      A: 'Assigned',
      S: 'Submitted',
      C: 'Completed',
    }
    return (
      <Tab.Pane>
        <Segment basic className="currentJobPanel">
          <Header as="h3">Most Recent Job</Header>
          <div>
            <Segment basic className="flexContainerHorizontal">
              <div className="flexContainerHorizontalLeftGroup">
                <div>
                  <Header as="h5">Job ID:</Header>
                  <Label size="large">{recentJob ? recentJob.id : ''}</Label>
                </div>
                <div>
                  <Header as="h5">Status:</Header>
                  <Label
                    size="large"
                    color={
                      recentJob
                        ? recentJob.status === JobStatus.Completed
                          ? recentJob.success
                            ? 'green'
                            : 'red'
                          : undefined
                        : undefined
                    }
                  >
                    {recentJob ? jobStatusVerbose[recentJob.status] : ''}
                  </Label>
                </div>
                <div>
                  <Button negative>Cancel</Button>
                </div>
              </div>

              <Modal
                trigger={
                  <Button
                    color="green"
                    size="large"
                    className="runL2AJobButton"
                    onClick={() => console.log(this.props.allSelectedTiles.length)}
                    disabled={this.props.session.currentAoi === '' || this.props.allSelectedTiles.length === 0}
                  >
                    Create New L3B Job
                  </Button>
                }
                closeIcon
                size="tiny"
                onClose={() => {
                  let newL2AFormState = {
                    submitting: false,
                    finished: false,
                    success: false,
                    msg: '',
                  }
                  let mainSession = this.props.session

                  mainSession.forms.createL2AJob = newL2AFormState

                  this.props.updateMainSession(mainSession)
                }}
              >
                <Header icon="hammer" content="Create L3B Job" />
                <Modal.Content>
                  <div>
                    <Formik
                      initialValues={initialValues}
                      onSubmit={(values, actions) => {
                        console.log({ values, actions })

                        let newL2AFormState = {
                          submitting: true,
                          finished: false,
                          success: false,
                          msg: 'Submitting job to server...',
                        }
                        let mainSession = this.props.session
                        mainSession.forms.createL2AJob = newL2AFormState
                        this.props.updateMainSession(mainSession)

                        console.log(this.props.selectedTiles)
                        console.log(this.props.imageryList)
                        const newJob: Job = {
                          aoiId: this.props.session.currentAoi,
                          assignedDate: '',
                          completedDate: '',
                          id: '',
                          status: JobStatus.Submitted,
                          submittedDate: '',
                          success: false,
                          type: 'Sen2Agri_L3B',
                          workerId: '',
                          tileDict: this.props.selectedTiles,
                          resultMessage: '',
                          params: {
                            l3b: {
                              prevNDays: values.prevNDays,
                              activeAoiName: this.props.aois.byId[this.props.session.currentAoi].name,
                              imageryList: this.props.imageryList,
                              processingType: 'MONO',
                              generateModel: false,
                              generateFapar: false,
                              generateFcover: false,
                              useInra: false,
                            },
                          },
                        }
                        console.log('Submitting L2A job')
                        this.props.thunkAddJob(newJob)
                      }}
                      validationSchema={this.createL2ASchema}
                    >
                      {({
                        values,
                        handleSubmit,
                        setFieldValue,
                        setFieldTouched,
                        errors,
                        touched,
                        validateField,
                        resetForm,
                      }) => {
                        return (
                          <div>
                            <Form
                              size="large"
                              onSubmit={handleSubmit}
                              loading={this.props.session.forms.createL2AJob.submitting}
                            >
                              <FormikField name="prevNDays">
                                {({ field, form, meta }: { field: any; form: any; meta: any }) => (
                                  <Form.Field>
                                    <label>Previous L2A Dates to Use</label>
                                    <Form.Group>
                                      <Slider
                                        mode={1}
                                        step={1}
                                        domain={domain}
                                        rootStyle={sliderStyle}
                                        onChange={(value: number) => {
                                          setFieldValue('prevNDays', value)
                                        }}
                                        onUpdate={(value: number) => {
                                          setFieldValue('prevNDays', value)
                                        }}
                                        values={[values.prevNDays]}
                                        initialValue={values.prevNDays}
                                        tickValues={[0, 1, 2, 3]}
                                      ></Slider>
                                      <Form.Input
                                        {...field}
                                        type="number"
                                        width={3}
                                        error={meta.touched && meta.error && meta.error}
                                      />
                                      <Popup
                                        trigger={
                                          <div className="iconContainer">
                                            <Icon color="grey" size="large" name="question circle outline" />
                                          </div>
                                        }
                                        content={`This is how many L2A products from previous dates will be used in
                                                the atmospheric correction. 2-3 works the best.`}
                                        inverted
                                        position="right center"
                                        mouseEnterDelay={250}
                                      />
                                    </Form.Group>
                                  </Form.Field>
                                )}
                              </FormikField>

                              <div className="buttonAndStatus">
                                <Button type="submit" className="flexItem" primary>
                                  Submit L2A Job
                                </Button>
                              </div>
                            </Form>
                            <Message
                              hidden={this.props.session.forms.createL2AJob.msg === ''}
                              positive={
                                this.props.session.forms.createL2AJob.finished &&
                                this.props.session.forms.createL2AJob.success
                              }
                              negative={
                                this.props.session.forms.createL2AJob.finished &&
                                !this.props.session.forms.createL2AJob.success
                              }
                            >
                              <p>{this.props.session.forms.createL2AJob.msg}</p>
                            </Message>
                          </div>
                        )
                      }}
                    </Formik>
                  </div>
                </Modal.Content>
              </Modal>
            </Segment>
            <Progress
              size="large"
              percent={overallProgressPercent}
              active={recentJob ? recentJob.status === JobStatus.Assigned : undefined}
              color={
                recentJob
                  ? recentJob.success && recentJob.status === JobStatus.Completed
                    ? 'green'
                    : undefined
                  : undefined
              }
            >
              Overall Progress
            </Progress>
            <Segment basic className={tileTableClass}>
              <Dimmer inverted active={this.props.session.forms.updateTileStatus.submitting}>
                <Loader active>Loading Tile Statuses</Loader>
              </Dimmer>
              <Table celled structured compact size="small">
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell rowSpan="2">Dates</Table.HeaderCell>
                    <Table.HeaderCell rowSpan="2">Task ID</Table.HeaderCell>
                    <Table.HeaderCell rowSpan="2">Status</Table.HeaderCell>
                    <Table.HeaderCell rowSpan="2">Progress</Table.HeaderCell>
                    <Table.HeaderCell colSpan={tiles.length}>Tiles</Table.HeaderCell>
                  </Table.Row>
                  <Table.Row>
                    {tiles.map(item => {
                      return <Table.HeaderCell>{item}</Table.HeaderCell>
                    })}
                  </Table.Row>
                </Table.Header>

                <Table.Body>
                  {[...dates].sort().map(date => {
                    return (
                      <Table.Row>
                        <Table.Cell>{date}</Table.Cell>
                        <Table.Cell>TASK ID HERE</Table.Cell>
                        <Table.Cell>
                          <Label>TASK STATUS HERE</Label>
                        </Table.Cell>
                        <Table.Cell>
                          <Progress size="small" percent={0} />
                        </Table.Cell>

                        {tiles.map(tile => {
                          const tileExistsForDate = Object.keys(imageryListByTile[tile]).includes(date)

                          if (tileExistsForDate) {
                            return (
                              <Table.Cell>
                                <Label size="mini">Mono</Label>
                                <Label size="mini">N-Days</Label>
                                <Label size="mini">End of Season</Label>
                              </Table.Cell>
                            )
                          } else {
                            return <Table.Cell className="noImageryCell" disabled></Table.Cell>
                          }
                        })}
                      </Table.Row>
                    )
                  })}

                  {/*
                      
                    // console.log(imageryListByTile[tile])
                    // const datesList: ImageryDates = imageryListByTile[tile]
                    // console.log('dates list ')
                    // console.log(datesList)
                    // let taskIdForTile: string = undefined
                    // let progressInfo = undefined
                    // let progressPercent = undefined
                    // let progressStatus = undefined
                    // if (recentJob && recentJob.hasOwnProperty('progressInfo')) {
                    //   recentJob.progressInfo.task_ids.map((item: string[]) => {
                    //     if (item[0] === tile) taskIdForTile = item[1]
                    //   })
                    //   console.log(`Tile: ${tile}`)
                    //   console.log(`Task ID: ${taskIdForTile}`)
                    //   progressInfo = recentJob.progressInfo.task_progress[taskIdForTile]
                    //   if (progressInfo) {
                    //     if (progressInfo.hasOwnProperty('status')) {
                    //       progressStatus = progressInfo.status
                    //     }
                    //     if (progressInfo.hasOwnProperty('progress')) {
                    //       if (progressInfo.progress) {
                    //         progressPercent =
                    //           (progressInfo.progress.dates_completed / progressInfo.progress.dates_total) * 100
                    //       } else {
                    //         progressPercent = 0
                    //       }
                    //     }
                    //   }
                    // }
                    // return (
                    //   <Table.Row textAlign="center">
                    //     <Table.Cell>{tile}</Table.Cell>
                    //     <Table.Cell>
                    //       {taskIdForTile ? <abbr title={taskIdForTile}>{taskIdForTile.slice(0, 8)}</abbr> : ''}
                    //     </Table.Cell>
                    //     <Table.Cell>
                    //       <Label>{progressInfo ? progressInfo.status : ''}</Label>
                    //     </Table.Cell>
                    //     <Table.Cell>
                    //       <Progress
                    //         size="small"
                    //         percent={progressPercent ? progressPercent : 0}
                    //         active={progressStatus ? (progressStatus === 'STARTED' ? true : false) : true}
                    //         color={
                    //           progressStatus
                    //             ? progressInfo.status === 'STARTED'
                    //               ? 'grey'
                    //               : progressInfo.status === 'SUCCESS'
                    //               ? 'green'
                    //               : 'red'
                    //             : undefined
                    //         }
                    //       ></Progress>
                    //     </Table.Cell>
                    //     {[...dates].sort().map((d: string) => {
                    //       if (Object.keys(imageryListByTile[tile]).includes(d)) {
                    //         const tileId = datesList[d]
                    //         const tileInfo = this.props.tiles.byId[imageryListByTile[tile][d]]
                    //         console.log(tileId)
                    //         console.log(tileInfo)
                    //         let tileL1CS3Url = undefined
                    //         let tileSen2AgriL2aS3Url = undefined
                    //         if (tileInfo.properties.hasOwnProperty('l1cS3Url') && tileInfo.properties.l1cS3Url)
                    //           tileL1CS3Url = tileInfo.properties['l1cS3Url']
                    //         if (
                    //           tileInfo.properties.hasOwnProperty('sen2agriL2aS3Url') &&
                    //           tileInfo.properties.sen2agriL2aS3Url
                    //         )
                    //           tileSen2AgriL2aS3Url = tileInfo.properties['sen2agriL2aS3Url']
                    //         return (
                    //           <Table.Cell className="statusCell">
                    //             <Label color={tileL1CS3Url ? 'green' : 'red'} size="mini">
                    //               L1C
                    //             </Label>
                    //             <Label color={tileSen2AgriL2aS3Url ? 'green' : 'red'} size="mini">
                    //               L2A
                    //             </Label>
                    //           </Table.Cell>
                    //         )
                    //       } else {
                    //         return <Table.Cell className="noImageryCell" disabled></Table.Cell>
                    //       }
                    //     })}
                    //   </Table.Row>
                    // )
                */}
                </Table.Body>
              </Table>
            </Segment>
          </div>
        </Segment>
        <Segment basic className="previousJobsPanel">
          <Header as="h3">Previous Jobs</Header>
          <Table celled>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Job ID</Table.HeaderCell>
                <Table.HeaderCell>Overall Status</Table.HeaderCell>
                <Table.HeaderCell>Success</Table.HeaderCell>
                <Table.HeaderCell>Date Submitted</Table.HeaderCell>
                <Table.HeaderCell>Date Started</Table.HeaderCell>
                <Table.HeaderCell>Date Completed</Table.HeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {previousJobs.map(job => {
                return (
                  <Table.Row>
                    <Table.Cell>
                      <Label>
                        <abbr title={job.id}>{job.id.slice(0, 8)}</abbr>
                      </Label>
                    </Table.Cell>
                    <Table.Cell>
                      <Label>{jobStatusVerbose[job.status]}</Label>
                    </Table.Cell>
                    <Table.Cell>
                      {job.success ? <Icon color="green" name="checkmark" /> : <Icon color="red" name="times" />}
                    </Table.Cell>
                    <Table.Cell>{job.submittedDate}</Table.Cell>
                    <Table.Cell>{job.assignedDate}</Table.Cell>
                    <Table.Cell>{job.completedDate}</Table.Cell>
                  </Table.Row>
                )
              })}
            </Table.Body>
          </Table>
        </Segment>
      </Tab.Pane>
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
)(Sen2AgriL2APanel)
