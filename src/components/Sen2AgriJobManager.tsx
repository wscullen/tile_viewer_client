import '../assets/css/Sen2AgriJobManager.scss'
import '../assets/css/App.scss'

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
  Grid,
  Progress,
  Table,
  Modal,
  Checkbox,
  Message,
  Form,
  Popup,
  Segment,
} from 'semantic-ui-react'

import {
  Formik,
  Form as FormikForm,
  Field as FormikField,
  FormikHelpers,
  FormikProps,
  FieldProps,
  ErrorMessage,
  FieldInputProps,
  FormikBag,
  FieldMetaProps,
} from 'formik'

import Slider from './Slider'

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
import { updateMainSession } from '../store/session/actions'

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
    if (this.props.session.currentAoi) {
      this.props.thunkCheckImageryStatus(
        this.props.allSelectedTiles,
        's2_l1c',
        this.props.aois.byId[this.props.session.currentAoi].name,
      )
    }
  }

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
    console.log('Imagery List by Tile')
    console.log(this.props.imageryListByTile)

    const imageryListByTile = this.props.imageryListByTile.sentinel2
    let recentJob: Job = undefined
    let previousJobs: Job[]

    if (this.props.session.currentAoi) {
      const allJobsForAoi = this.props.jobs.byAoiId.hasOwnProperty(this.props.session.currentAoi) ? this.props.jobs.byAoiId[this.props.session.currentAoi] : []
      const aoiJobs = allJobsForAoi.filter((jobId: string): string => {
        const job = this.props.jobs.byId[jobId]
        if (job.type === 'Sen2Agri_L2A') {
          return jobId
        }
      })
      recentJob = this.props.jobs.byId[aoiJobs[aoiJobs.length - 1]]
      previousJobs = aoiJobs.slice(0, -1).map(jobId => {
        return this.props.jobs.byId[jobId]
      })
    }

    const allDates = []

    for (let value of Object.values(this.props.imageryListByTile.sentinel2)) {
      for (let v of Object.keys(value)) {
        console.log(v)
        allDates.push(v)
      }
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

    const panes = [
      {
        menuItem: 'Atmospheric Correction',
        render: () => (
          <Tab.Pane>
            <div className="currentJobPanel">
              <Header as="h3">Most Recent Job</Header>
              <div>
                <div className="flexContainerHorizontal">
                  <div className="flexContainerHorizontalLeftGroup">
                    <div>
                      <Header as="h5">Job ID:</Header>
                      <Label size="large">{recentJob ? recentJob.id : ""}</Label>
                    </div>
                    <div>
                      <Header as="h5">Status:</Header>
                      <Label size="large">{recentJob ? jobStatusVerbose[recentJob.status] : ""}</Label>
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
                        Create New L2A Job
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
                    <Header icon="hammer" content="Create L2A Job" />
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
                              checkedCount: 0,
                              completedDate: '',
                              id: '',
                              setIntervalId: 0,
                              status: JobStatus.Submitted,
                              submittedDate: '',
                              success: false,
                              type: 'Sen2Agri_L2A',
                              workerId: '',
                              tileDict: this.props.selectedTiles,
                              resultMessage: '',
                              params: {
                                l2a: {
                                  prevNDays: values.prevNDays,
                                  activeAoiName: this.props.aois.byId[this.props.session.currentAoi].name,
                                  imageryList: this.props.imageryList,
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
                </div>
                <Progress size="large" percent={55}>
                  Overall Progress
                </Progress>
                <div className="imageryStatusTable">
                  <Table celled compact size="small">
                    <Table.Header>
                      <Table.Row>
                        <Table.HeaderCell>Tiles</Table.HeaderCell>
                        <Table.HeaderCell>Task ID</Table.HeaderCell>
                        <Table.HeaderCell>Status</Table.HeaderCell>
                        <Table.HeaderCell>Progress</Table.HeaderCell>

                        {[...dates].sort().map(item => {
                          return (
                            <Table.HeaderCell className="dateHeader">
                              <p>{`${item.substring(0, 4)}-${item.substring(4, 6)}-${item.substring(6, 8)}`}</p>
                            </Table.HeaderCell>
                          )
                        })}
                      </Table.Row>
                    </Table.Header>

                    <Table.Body>
                      {Object.keys(imageryListByTile)
                        .sort()
                        .map(tile => {
                          console.log(imageryListByTile[tile])
                          const datesList: ImageryDates = imageryListByTile[tile]
                          console.log('dates list ')
                          console.log(datesList)
                          let taskIdForTile: string = undefined
                          let progressInfo = undefined
                          
                          if (recentJob) {
                            recentJob.progressInfo.task_ids.map((item: string[]) => {
                              if (item[0] === tile) taskIdForTile = item[1]
                            })
                            console.log(`Tile: ${tile}`)
                            console.log(`Task ID: ${taskIdForTile}`)
  
                            progressInfo = recentJob.progressInfo.task_progress[taskIdForTile]
                            console.log(progressInfo)
                          }
                          
                          return (
                            <Table.Row textAlign="center">
                              <Table.Cell>{tile}</Table.Cell>
                              <Table.Cell>
                                {taskIdForTile ? <abbr title={taskIdForTile}>{taskIdForTile.slice(0, 8)}</abbr> : ""}
                              </Table.Cell>
                              <Table.Cell>
                                <Label>{progressInfo ? progressInfo.status : ""}</Label>
                              </Table.Cell>
                              <Table.Cell>
                                <Progress size="small" percent={55}></Progress>
                              </Table.Cell>
                              {[...dates].sort().map((d: string) => {
                                if (Object.keys(imageryListByTile[tile]).includes(d)) {
                                  const tileId = datesList[d]
                                  const tileInfo = this.props.tiles.byId[imageryListByTile[tile][d]]

                                  console.log(tileId)
                                  console.log(tileInfo)
                                  let tileL1CS3Url = undefined

                                  if (tileInfo.properties.hasOwnProperty('l1cS3Url'))
                                    tileL1CS3Url = tileInfo.properties['l1cS3Url']

                                  return (
                                    <Table.Cell className="statusCell">
                                      <Label color={tileL1CS3Url ? 'green' : 'red'} size="mini">
                                        L1C
                                      </Label>
                                      <Label size="mini">L2A</Label>
                                    </Table.Cell>
                                  )
                                } else {
                                  return <Table.Cell className="noImageryCell" disabled></Table.Cell>
                                }
                              })}

                              {/* <Table.Cell>
                            <Label circular color="black" empty></Label>
                          </Table.Cell>
                          <Table.Cell>
                            <Label circular color="grey" empty></Label>
                          </Table.Cell> */}
                            </Table.Row>
                          )
                        })}
                    </Table.Body>
                  </Table>
                </div>
              </div>
            </div>
            <div className="previousJobsPanel">
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
            </div>
          </Tab.Pane>
        ),
      },
      { menuItem: 'Cloudfree Composite', render: () => <Tab.Pane>Generate L3A cloudfree composite images.</Tab.Pane> },
      { menuItem: 'LAI and NDVI', render: () => <Tab.Pane>Generate L3B LAI and NDVI products.</Tab.Pane> },
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
  },
)(Sen2AgriJobManager)
