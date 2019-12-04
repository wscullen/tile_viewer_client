import './../assets/css/AddAreaOfInterestModal.scss'

import React, { Component } from 'react'
import { connect } from 'react-redux'
import moment, { Moment } from 'moment'
import omit from 'lodash/omit'

import Dropzone from 'react-dropzone'

import { AppState as ReduxAppState } from '../store/'

import SemanticDatepicker from 'react-semantic-ui-datepickers'

import Modal from './Modal'

const path = require('path')

import { Header, Button, Popup, Grid, Form, Message, Label } from 'semantic-ui-react'

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

import { TileState, Tile, TileListByDate } from '../store/tile/types'
import { JobState } from '../store/job/types'

import { addTile, updateTile } from '../store/tile/actions'

import {
  AreaOfInterestState,
  AreaOfInterest,
  TileList as TileListInterface,
  Session,
  CurrentDates,
  DateObject,
} from '../store/aoi/types'

import { MainSessionState } from '../store/session/types'

import * as Yup from 'yup'

import { thunkStartAddAoi } from '../store/aoi/thunks'

import { SessionSettings, FormUi } from '../store/session/types'
import { updateAddAoiForm } from '../store/session/actions'

import DatePickerFormikWrapper from '../components/DatePickerFormikWrapper'
import FileInputWrapper from '../components/FileInputWrapper'
import FileDropzoneWrapper from '../components/FileDropzoneWrapper'
import Checkbox from '../components/CheckboxWrapper'

export const START_DATE = 'startDate'
export const END_DATE = 'endDate'

type START_OR_END_DATE = 'startDate' | 'endDate'

const SUPPORTED_FORMATS = ['.shp', '.shx', '.cpg', '.prj', '.dbf']

declare var VERSION: string

const defaultState = {
  tileViewerVersion: VERSION,
  jobManagerEmail: 'name@email.com',
  submitting: false,
}

interface AddAoiFormValues {
  siteName: string
  dateRange: Date[]
  files: any
  platforms: string[]
  // password: string
  // url: string
}

interface AppProps {
  autoFocus?: boolean
  autoFocusEndDate?: boolean
  initialStartDate?: any
  initialEndDate?: any
  hideModal: Function
  aoiNames: string[]
  settings: SessionSettings
  show: boolean
  thunkStartAddAoi: any
  updateAddAoiForm: any
  session: MainSessionState
}

interface AppState {
  focusedInput: START_OR_END_DATE
  startDate: Moment
  endDate: Moment
  platforms: string[]
  files: File[]
  loading: boolean
  showResult: boolean
  areaCreated: boolean
  name: string
  formValid: boolean
  nameErrorMessage: string
  csrfToken: string
  message: string
  aois?: AreaOfInterestState
  session?: MainSessionState
  jobs?: JobState
  tiles?: TileState
}

class AddAreaOfInterestModal extends Component<AppProps, AppState> {
  fileInput: React.RefObject<HTMLInputElement>
  form: React.RefObject<HTMLFormElement>
  addAoiSchema: any
  handleReset: any

  constructor(props: AppProps) {
    super(props)

    let focusedInput: START_OR_END_DATE = null
    if (props.autoFocus) {
      focusedInput = START_DATE
    } else if (props.autoFocusEndDate) {
      focusedInput = END_DATE
    }

    this.state = {
      focusedInput,
      startDate: props.initialStartDate,
      endDate: props.initialEndDate,
      platforms: [],
      files: [],
      loading: false,
      showResult: false,
      areaCreated: false,
      name: '',
      formValid: false,
      nameErrorMessage: '',
      csrfToken: null,
      message: '',
    }

    this.fileInput = React.createRef()
    this.form = React.createRef()

    this.addAoiSchema = Yup.object().shape({
      siteName: Yup.string()
        .min(5, 'Site name must be 5 characters or longer.')
        .required('Required.')
        .test('Site name', 'Site name already taken.', (value: any): boolean => {
          if (value) {
            console.log(value)
            let siteNames = this.props.aoiNames
            console.log(siteNames)
            if (siteNames.includes(value.trim())) return false
            else return true
          }
        }),
      dateRange: Yup.mixed().test('Date Range', 'Required.', (value: any): boolean => {
        console.log('VALIDATING DATE RANGE')
        console.log(value)
        if (value && value.length === 2) return true
        else return false
      }),
      platforms: Yup.mixed()
        .test('Array of platform strings', 'At least 1 platform must be selected.', (value: any): boolean => {
          console.log(value)
          if (value.length === 0) return false
          else return true
        })
        .required('Required.'),

      // password: Yup.string()
      //   .min(3, 'Password must be 3 characters at minimum')
      //   .required('Required.'),
      // url: Yup.string()
      //   .url('Invalid URL')
      //   .required('Required.'),
    })
  }

  onDatesChange = ({ startDate, endDate }: { startDate: Moment; endDate: Moment }) => {
    this.setState({
      startDate: startDate,
      endDate: endDate,
    })
  }

  onFocusChange = (focusedInput: any) => {
    this.setState({ focusedInput })
  }

  platformSelected = (event: any) => {
    const platformName: string = event.target.name
    const platforms: string[] = [...this.state.platforms]
    const platformIndex = platforms.indexOf(platformName)

    if (platformIndex === -1) {
      platforms.push(platformName)
    } else {
      platforms.splice(platformIndex, 1)
    }

    this.setState({
      platforms,
    })
  }

  filesSelected = (event: any) => {
    console.log(event)

    this.setState({
      files: Array.from(this.fileInput.current.files),
    })
  }

  nameUpdated = (event: any) => {
    console.log(event)
    this.setState({
      name: event.target.value,
    })
  }

  showSelectedFiles = () => {
    return (
      <ul className="fileList">
        {this.state.files.map((ele, index) => {
          return <li key={index}>{ele.name}</li>
        })}
      </ul>
    )
  }

  submitAreaOfInterest = () => {
    console.log('Creating new area of interest')

    const formData = new FormData()

    // should be an array once s2 and l8 are supported together
    formData.append('platforms', this.state.platforms.join(','))
    formData.append('startDate', this.state.startDate.format('YYYYMMDD'))
    formData.append('endDate', this.state.endDate.format('YYYYMMDD'))
    formData.append('name', this.state.name)

    for (const f of this.state.files) {
      formData.append('shapefiles', f)
    }
    console.log('thunk starts here')
    this.props.thunkStartAddAoi(formData)
  }

  fileValidation = (values: any) => {
    console.log('field validation')
    console.log(values)
    let missingFileTypes = Array.from(SUPPORTED_FORMATS)
    console.log(missingFileTypes)
    for (let fileType of SUPPORTED_FORMATS) {
      for (let file of values) {
        console.log(path.extname(file.name))
        console.log(fileType)
        if (path.extname(file.name) === fileType) {
          missingFileTypes.splice(missingFileTypes.indexOf(fileType), 1)
          break
        }
      }
    }

    let error = undefined
    if (missingFileTypes.length !== 0) {
      error = `Missing the following files for a valid shapefile: ${missingFileTypes.map((value: any) => value)}`
    }
    return error
  }

  displayLoadingMessage = () => {
    if (this.state.message !== '') {
      return <h5>{this.state.message}</h5>
    }
  }

  modalCleanup = () => {
    if (this.state.areaCreated === true) {
      this.setState({
        showResult: false,
        message: '',
      })
    }
    this.handleReset()

    this.props.hideModal()
  }

  validateName = (name: string): boolean => {
    console.log(name)
    let valid = true

    if (this.props.aoiNames.includes(name)) {
      valid = false
      this.setState({
        nameErrorMessage: 'Name already taken.',
      })
    }

    if (name.length < 5) {
      valid = false
      console.log('name too short')
      this.setState({
        nameErrorMessage: 'Name too short.',
      })
    }

    return valid
  }

  handleSubmit = (event: any) => {
    event.preventDefault()
    // process form submission here
    console.log(event)
    // method="post" enctype="multipart/form-data"
    // `Selected file - ${
    //   this.fileInput.current.files[0].name
    // }`

    const nameValid = this.validateName(this.state.name)

    if (!nameValid) {
      return
    }

    for (const f of Array.from(this.fileInput.current.files)) {
      console.log(f.name)
    }

    this.setState({
      nameErrorMessage: '',
    })

    const headers = new Headers()

    if (this.state.csrfToken === null) {
      console.log('fetching csrf token')
      fetch(`${this.props.settings.s2d2Url}/generate_csrf/`, {
        method: 'GET',
        mode: 'cors',
        cache: 'default',
        headers: headers,
      })
        .then(response => response.json())
        .then(response => {
          console.log('Success:', JSON.stringify(response))
          this.setState({
            csrfToken: JSON.stringify(response),
          })

          this.submitAreaOfInterest()
        })
        .catch(error => console.error('Error:', error))
    } else {
      this.submitAreaOfInterest()
    }
  }

  render() {
    const { focusedInput, startDate, endDate } = this.state

    // autoFocus, autoFocusEndDate, initialStartDate and initialEndDate are helper props for the
    // example wrapper but are not props on the SingleDatePicker itself and
    // thus, have to be omitted.
    const props = omit(this.props, [
      'autoFocus',
      'autoFocusEndDate',
      'initialStartDate',
      'initialEndDate',
      'stateDateWrapper',
      'hideModal',
      'show',
      'addAreaOfInterest',
      'settings',
      'aoiNames',
    ])

    const showHideClassName = this.state.showResult
      ? 'loadingIndicators display-inline'
      : 'loadingIndicators display-none'

    const landsat8Selected = this.state.platforms.indexOf('landsat8') !== -1
    const sentinel2Selected = this.state.platforms.indexOf('sentinel2') !== -1

    const initialValues: AddAoiFormValues = {
      siteName: '',
      dateRange: [],
      files: [],
      platforms: [],
    }

    return (
      <Modal show={this.props.show} handleClose={this.modalCleanup}>
        <h2>Area of Interest Constraints</h2>
        <Formik
          initialValues={initialValues}
          onSubmit={(values, actions) => {
            console.log({ values, actions })
            let newAoiFormState = {
              submitting: true,
              finished: false,
              success: false,
              msg: 'Sending request to server... (this can take a while)',
            }
            console.log('-----------------------------------alskdjfl;aksjf;laskjf;lkj')
            this.props.updateAddAoiForm(newAoiFormState)
            let data = new FormData()

            for (let f of values.files) {
              console.log(f)
              data.append('shapefiles', f, f.name)
            }

            data.append('startDate', moment(values.dateRange[0]).format('YYYYMMDD'))
            data.append('endDate', moment(values.dateRange[1]).format('YYYYMMDD'))
            data.append('platforms', values.platforms.join(','))
            data.append('name', values.siteName)

            this.props.thunkStartAddAoi(data, actions.resetForm)
          }}
          validationSchema={this.addAoiSchema}
        >
          {({ values, handleSubmit, setFieldValue, setFieldTouched, errors, touched, validateField, resetForm }) => {
            this.handleReset = resetForm

            return (
              <FormikForm>
                <Form loading={this.props.session.forms.addAoi.submitting}>
                  <FormikField name="siteName">
                    {({ field, form, meta }: { field: any; form: any; meta: any }) => (
                      <Form.Input
                        {...field}
                        label="Site Name"
                        name="siteName"
                        id="siteName"
                        error={meta.touched && meta.error && meta.error}
                      />
                    )}
                  </FormikField>
                  <FormikField name="dateRange" fluid>
                    {({ field, form, meta }: { field: any; form: any; meta: any }) => (
                      <SemanticDatepicker
                        onChange={(e: any, data: any) => {
                          console.log('wath')
                          console.log(data)
                          setFieldValue('dateRange', data.value, false)
                          setFieldTouched('dateRange', false)
                          console.log(values.dateRange)
                          // if (data.value && data.value.length === 2) setFieldTouched('dateRange', true)

                          // setTimeout(() => validateField('dateRange'), 300)
                        }}
                        type="range"
                        placeholder="YYYY-MM-DD - YYYY-MM-DD"
                        label="Date Range"
                        iconPosition="left"
                        name="dateRange"
                        error={meta.touched && meta.error && meta.error}
                        value={values.dateRange}
                      />
                    )}
                  </FormikField>
                  <Form.Field>
                    <FormikField
                      component={FileDropzoneWrapper}
                      name="files"
                      validate={this.fileValidation}
                      filesValidator={this.fileValidation}
                      required
                    />
                  </Form.Field>
                  <Form.Field error={errors.hasOwnProperty('platforms') && touched.hasOwnProperty('platforms')}>
                    <label>Platforms</label>
                    <Checkbox name="platforms" value="landsat8" label="Landsat 8" /> <br />
                    <Checkbox name="platforms" value="sentinel2" label="Sentinel 2" /> <br />
                    {errors.hasOwnProperty('platforms') && touched.hasOwnProperty('platforms') ? (
                      <Label prompt pointing={'above'}>
                        {errors.platforms}
                      </Label>
                    ) : null}
                  </Form.Field>

                  <div className="buttonAndStatus">
                    <Button type="submit" className="flexItem" primary>
                      Create Area of Interest
                    </Button>
                  </div>
                </Form>
                <Message
                  hidden={this.props.session.forms.addAoi.msg === ''}
                  positive={this.props.session.forms.addAoi.finished && this.props.session.forms.addAoi.success}
                  negative={this.props.session.forms.addAoi.finished && !this.props.session.forms.addAoi.success}
                >
                  <p>{this.props.session.forms.addAoi.msg}</p>
                </Message>
              </FormikForm>
            )
          }}
        </Formik>
      </Modal>
    )
  }
}

const mapStateToProps = (state: ReduxAppState) => ({
  session: state.session,
  aois: state.aoi,
})

export default connect(
  mapStateToProps,
  {
    thunkStartAddAoi,
    updateAddAoiForm,
  },
)(AddAreaOfInterestModal)
