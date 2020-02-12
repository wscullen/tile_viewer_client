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
} from '../store/aoi/types'

import { addAoi, updateAoi, removeAoi, updateSession } from '../store/aoi/actions'
import { TileList } from '../store/aoi/types'

import { JobState, Job, JobStatus } from '../store/job/types'
import { addJob, removeJob, updateJob } from '../store/job/actions'

import { thunkAddJob } from '../store/job/thunks'
import { thunkUpdateCsrfTokens } from '../store/session/thunks'

import { MainSessionState } from '../store/session/types'
import { updateMainSession } from '../store/session/actions'

import { thunkSendMessage } from '../thunks'

import {
  getAoiNames,
  getSelectedTiles,
  getHighlightedTiles,
  getAllSelectedTiles,
  getImageryListForSen2Agri,
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

    const panes = [
      {
        menuItem: 'Atmospheric Correction',
        render: () => (
          <Tab.Pane>
            <div>
              <Header>Most Recent Job</Header>
              <div className="flexContainerHorizontal">
                <div className="flexContainerHorizontalLeftGroup">
                  <div>
                    <p>Job ID: </p> <Label>UUID GOES HERE</Label>
                  </div>
                  <div>
                    <p>Status:</p>
                    <Label>JOB STATUS HERE</Label>
                  </div>
                  <div>
                    <Button>Cancel</Button>
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
                            status: 0,
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
              <Progress percent={55}>Overall Progress</Progress>

              <Table definition celled>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell>Tiles</Table.HeaderCell>
                    <Table.HeaderCell>Status</Table.HeaderCell>
                    <Table.HeaderCell>Date 1</Table.HeaderCell>
                    <Table.HeaderCell>Date 2</Table.HeaderCell>
                    <Table.HeaderCell>Date 3</Table.HeaderCell>
                  </Table.Row>
                </Table.Header>

                <Table.Body>
                  <Table.Row>
                    <Table.Cell>12UPR</Table.Cell>
                    <Table.Cell>
                      <Label>In Progress</Label>
                    </Table.Cell>
                    <Table.Cell>
                      <Label circular color="green" empty basic></Label>
                    </Table.Cell>
                    <Table.Cell>
                      <Label circular color="black" empty></Label>
                    </Table.Cell>
                    <Table.Cell>
                      <Label circular color="grey" empty></Label>
                    </Table.Cell>
                  </Table.Row>
                </Table.Body>
              </Table>
              <Header>Previous Jobs</Header>
              <Table celled>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell>Job ID</Table.HeaderCell>
                    <Table.HeaderCell>Overall Status</Table.HeaderCell>
                    <Table.HeaderCell>Date Submitted</Table.HeaderCell>
                    <Table.HeaderCell>Date Completed</Table.HeaderCell>
                  </Table.Row>
                </Table.Header>

                <Table.Body>
                  <Table.Row>
                    <Table.Cell>Job ID HERE</Table.Cell>
                    <Table.Cell>Overall Status Here</Table.Cell>
                    <Table.Cell>Date Started here</Table.Cell>
                    <Table.Cell>Date Completed here</Table.Cell>
                  </Table.Row>
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
        <Header size="medium">Sen2Agri Job Manager</Header>
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
  },
)(Sen2AgriJobManager)
