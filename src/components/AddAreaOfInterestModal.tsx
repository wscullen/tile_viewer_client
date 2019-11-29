import './../assets/css/AddAreaOfInterestModal.css'

import React, { Component } from 'react'
import { connect } from 'react-redux'
import moment, { Moment } from 'moment'
import omit from 'lodash/omit'

import { AppState as ReduxAppState } from '../store/'

const path = require('path')

import { Alert, Modal, Button, Icon, Form, Input, Spin, Select } from 'antd'

import { withFormik, Form as FormikForm, Field as FormikField, Formik } from 'formik'
const FormItem = Form.Item
const Option = Select.Option

import { TileState } from '../store/tile/types'
import { JobState } from '../store/job/types'

import { AreaOfInterestState } from '../store/aoi/types'

import { MainSessionState } from '../store/session/types'

import * as Yup from 'yup'

import { thunkStartAddAoi } from '../store/aoi/thunks'

import { SessionSettings } from '../store/session/types'
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
  startDate: Moment
  endDate: Moment
  files: any
  platforms: string[]
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
  siteName?: any
}

const formItemLayout = {
  labelCol: {
    xs: { span: 4 },
    sm: { span: 4 },
  },
  wrapperCol: {
    xs: { span: 12 },
    sm: { span: 12 },
  },
}

//@ts-ignore
const InnerForm = ({
  props,
  values,
  errors,
  touched,
  setFieldTouched,
  setFieldValue,
  isSubmitting,
  handleSubmit,
}: {
  props?: any
  values?: any
  errors?: any
  touched?: any
  setFieldTouched?: any
  setFieldValue?: any
  isSubmitting?: any
  handleSubmit?: any
}) => {
  return (
    <FormikForm onSubmit={handleSubmit}>
      <FormikField name="siteName">
        {({ field, form, meta }: { field: any; form: any; meta: any }) => {
          return (
            <FormItem label="Site Name" help={meta.error} validateStatus={meta.touched && meta.error ? 'error' : null}>
              <Input
                type="text"
                {...field}
                onChange={value => setFieldValue('siteName', value)}
                onBlur={() => setFieldTouched('siteName', true)}
              />
            </FormItem>
          )
        }}
      </FormikField>
      <FormItem>
        <FormikField
          name="fruit"
          render={({ field }: { field: any }) => (
            <Select
              {...field}
              onChange={value => setFieldValue('fruit', value)}
              onBlur={() => setFieldTouched('fruit', true)}
              value={values.fruit}
            >
              <Option key={1} value="Apple">
                Apple
              </Option>
              <Option key={2} value="Orange">
                Orange
              </Option>
              <Option key={3} value="Mango">
                Mango
              </Option>
              <Option key={4} value="Pineapple">
                Pineapple
              </Option>
            </Select>
          )}
        />
      </FormItem>
      <FormItem>
        <Button htmlType="submit" type="primary" disabled={isSubmitting}>
          Create Area of Interest
        </Button>
      </FormItem>
    </FormikForm>
  )
}

const AddAoiForm = (props: any) => {
  const { getFieldDecorator, getFieldsError, getFieldError, isFieldTouched } = props.form

  return (
    <Form {...formItemLayout} onSubmit={() => console.log('hello!')}>
      <FormikField name="siteName">
        {({ field, form, meta }: { field: any; form: any; meta: any }) => {
          return (
            <Form.Item label="Site Name">
              {getFieldDecorator('text', {
                rules: [
                  {
                    required: true,
                    message: 'Site name is required!',
                  },
                ],
              })(<Input />)}
            </Form.Item>
          )
        }}
      </FormikField>
    </Form>
  )
}

class AddAreaOfInterestModal extends Component<AppProps, AppState> {
  formik: React.RefObject<HTMLFormElement>
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
      siteName: {
        validateStatus: 'success',
        errorMsg: null,
        value: '',
      },
    }

    this.formik = React.createRef()
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
        console.log(file.type)
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

    console.log(this.formik)
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

  validateSiteName = (name: string): { validateStatus: string; errorMsg: string } => {
    console.log(name)
    let valid = true

    if (this.props.aoiNames.includes(name)) {
      valid = false
      return {
        validateStatus: 'error',
        errorMsg: 'Name already taken.',
      }
    }

    if (name.length < 5) {
      valid = false
      console.log('name too short')
      return {
        validateStatus: 'error',
        errorMsg: 'Name too short.',
      }
    }

    return {
      validateStatus: 'success',
      errorMsg: null,
    }
  }

  handleSiteNameChange = (name: any) => {
    console.log(name)
    this.setState({
      siteName: {
        ...this.validateSiteName(name),
        value: name,
      },
    })
  }

  render() {
    const { focusedInput, startDate, endDate } = this.state
    const addAoiSchema = Yup.object().shape({
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
      startDate: Yup.mixed().test('Moment Object', 'Start date is required.', (value: any): boolean => {
        console.log('START DATE VALIDATION')
        console.log(value)
        if (value) return true
        else return false
      }),
      endDate: Yup.mixed().test('Moment Object', 'End date is required.', (value: any): boolean => {
        console.log('END DATE VALIDATION')
        console.log(value)

        if (value) return true
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
      startDate: null,
      endDate: null,
      files: [],
      platforms: [],
    }

    const MyFormikForm = withFormik({
      mapPropsToValues({ props, username, fruit }: { props?: any; username?: any; fruit?: any }) {
        return {
          ...props,
          username: username || '',
          fruit: fruit || '',
        }
      },
      // validationSchema: yup.object().shape({
      // username: yup.string().required('Username is required'),
      // }),
      handleSubmit(values, { resetForm, setErrors, setSubmitting }) {
        setTimeout(() => {
          console.log('Form values', values)
          // save
          setSubmitting(false)
        }, 2000)
      },
    })(InnerForm)

    return (
      <Modal
        title={
          <div>
            <Icon type="flag" />
            Create Area of Interest
          </div>
        }
        visible={this.props.show}
        onCancel={this.modalCleanup}
        footer={null}
      >
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

            data.append('startDate', values.startDate.format('YYYYMMDD'))
            data.append('endDate', values.endDate.format('YYYYMMDD'))
            data.append('platforms', values.platforms.join(','))
            data.append('name', values.siteName)

            this.props.thunkStartAddAoi(data, actions.resetForm)
          }}
          validationSchema={addAoiSchema}
        >
          {({ values, handleSubmit, resetForm, setFieldValue, setFieldTouched, errors, touched, validateField }) => {
            this.handleReset = resetForm

            const showAlertMessage = this.props.session.forms.addAoi.finished
            const alertMessageType = this.props.session.forms.addAoi.success ? 'success' : 'error'

            return (
              <FormikForm>
                <Form {...formItemLayout} layout="horizontal">
                  <FormikField name="siteName">
                    {({ field, form, meta }: { field: any; form: any; meta: any }) => {
                      console.log(meta)
                      return (
                        <Form.Item
                          label="Site Name"
                          validateStatus={meta.touched && meta.error ? 'error' : 'success'}
                          help={meta.touched && meta.error && meta.error}
                        >
                          <Input
                            {...field}
                            value={values.siteName}
                            onChange={e => {
                              setFieldValue('siteName', e.target.value)
                              // setFieldTouched('siteName', true)
                            }}
                          />
                        </Form.Item>
                      )
                    }}
                  </FormikField>
                </Form>
                <Button type="primary" htmlType="submit" className="flexItem">
                  Create Area of Interest
                </Button>
                {/* <Message
                  hidden={this.props.session.forms.addAoi.msg === ''}
                  positive={this.props.session.forms.addAoi.finished && this.props.session.forms.addAoi.success}
                  negative={this.props.session.forms.addAoi.finished && !this.props.session.forms.addAoi.success}
                >
                  <p>{this.props.session.forms.addAoi.msg}</p>
                </Message> */}
              </FormikForm>
            )
          }}
        </Formik>

        {/* <Formik
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

            data.append('startDate', values.startDate.format('YYYYMMDD'))
            data.append('endDate', values.endDate.format('YYYYMMDD'))
            data.append('platforms', values.platforms.join(','))
            data.append('name', values.siteName)

            this.props.thunkStartAddAoi(data, actions.resetForm)
          }}
          validationSchema={addAoiSchema}
        >
          {({ values, handleSubmit, resetForm, setFieldValue, errors, touched, validateField }) => {
            this.handleReset = resetForm

            const showAlertMessage = this.props.session.forms.addAoi.finished
            const alertMessageType = this.props.session.forms.addAoi.success ? 'success' : 'error'
            const WrappedForm = Form.create({})(AddAoiForm)

            return (
              <FormikForm>
                <Spin spinning={this.props.session.forms.addAoi.submitting}>
                  <WrappedForm />
                </Spin>
              </FormikForm>
            )
          }}
        </Formik> */}
        {/* <MyFormikForm {...this.props} /> */}
      </Modal>
      // <Modal
      //   open={this.props.show}
      //   onClose={this.modalCleanup}
      //   closeOnEscape={false}
      //   closeOnDimmerClick={false}
      //   closeIcon
      //   centered={false}
      // >
      //   <Header icon="flag" content="Area of Interest Constraints" />
      //   <Modal.Content>
      //     <Formik
      //       initialValues={initialValues}
      //       onSubmit={(values, actions) => {
      //         console.log({ values, actions })
      //         let newAoiFormState = {
      //           submitting: true,
      //           finished: false,
      //           success: false,
      //           msg: 'Sending request to server... (this can take a while)',
      //         }
      //         console.log('-----------------------------------alskdjfl;aksjf;laskjf;lkj')
      //         this.props.updateAddAoiForm(newAoiFormState)
      //         let data = new FormData()

      //         for (let f of values.files) {
      //           console.log(f)
      //           data.append('shapefiles', f, f.name)
      //         }

      //         data.append('startDate', values.startDate.format('YYYYMMDD'))
      //         data.append('endDate', values.endDate.format('YYYYMMDD'))
      //         data.append('platforms', values.platforms.join(','))
      //         data.append('name', values.siteName)

      //         this.props.thunkStartAddAoi(data, actions.resetForm)
      //       }}
      //       validationSchema={addAoiSchema}
      //     >
      //       {({ values, handleSubmit, resetForm, setFieldValue, errors, touched, validateField }) => {
      //         this.handleReset = resetForm
      //         return (
      //           <Form>
      //             <FormSemantic loading={this.props.session.forms.addAoi.submitting}>
      //               <Field name="siteName">
      //                 {({ field, form, meta }: { field: any; form: any; meta: any }) => {
      //                   return (
      //                     <FormSemantic.Input
      //                       label="Site Name"
      //                       error={meta.touched && meta.error && meta.error}
      //                       type="text"
      //                       {...field}
      //                       name="siteName"
      //                       id="siteName"
      //                     />
      //                   )
      //                 }}
      //               </Field>
      //               <FormSemantic.Field>
      //                 <Field component={DatePickerFormikWrapper} name="datePicker" required />
      //               </FormSemantic.Field>
      //               <FormSemantic.Field>
      //                 <Field
      //                   component={FileDropzoneWrapper}
      //                   name="files"
      //                   validate={this.fileValidation}
      //                   filesValidator={this.fileValidation}
      //                   required
      //                 />
      //               </FormSemantic.Field>
      //               <FormSemantic.Field
      //                 error={errors.hasOwnProperty('platforms') && touched.hasOwnProperty('platforms')}
      //               >
      //                 <label>Platforms</label>
      //                 <div className="platformsCheckboxes">
      //                   <div>
      //                     <Checkbox name="platforms" value="landsat8" label="Landsat 8" /> <br />
      //                     <Checkbox name="platforms" value="sentinel2" label="Sentinel 2" />
      //                   </div>
      //                   <div>
      //                     {errors.hasOwnProperty('platforms') && touched.hasOwnProperty('platforms') ? (
      //                       <Label prompt pointing="left">
      //                         {errors.platforms}
      //                       </Label>
      //                     ) : null}
      //                   </div>
      //                 </div>
      //               </FormSemantic.Field>

      //               <div className="buttonAndStatus">
      //                 <Button type="submit" className="flexItem" primary>
      //                   Create Area of Interest
      //                 </Button>
      //               </div>
      //             </FormSemantic>
      //             <Message
      //               hidden={this.props.session.forms.addAoi.msg === ''}
      //               positive={this.props.session.forms.addAoi.finished && this.props.session.forms.addAoi.success}
      //               negative={this.props.session.forms.addAoi.finished && !this.props.session.forms.addAoi.success}
      //             >
      //               <p>{this.props.session.forms.addAoi.msg}</p>
      //             </Message>
      //           </Form>
      //         )
      //       }}
      //     </Formik>
      //   </Modal.Content>
      // </Modal>
    )
  }
}

const MyFormikForm = withFormik({
  mapPropsToValues({ props, username, fruit }: { props: any; username: any; fruit: any }) {
    return {
      ...props,
      username: username || '',
      fruit: fruit || '',
    }
  },
  // validationSchema: yup.object().shape({
  // username: yup.string().required('Username is required'),
  // }),
  handleSubmit(values, { resetForm, setErrors, setSubmitting }) {
    setTimeout(() => {
      console.log('Form values', values)
      // save
      setSubmitting(false)
    }, 2000)
  },
})(InnerForm)

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
