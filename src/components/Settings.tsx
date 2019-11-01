import './../assets/css/Settings.css'

import React, { Component } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { MainSessionState, Token, SessionSettings } from '../store/session/types'
import { getCSRFToken, getApiVersion, thunkAuthenticate } from '../store/session/thunks'
import { updateMainSession } from '../store/session/actions'
import { connect } from 'react-redux'
import { AppState } from '../store/'

import { History } from 'history'
import { thisExpression } from '@babel/types'

import { Button, FormFeedback, FormGroup, Label, Input } from 'reactstrap'
import {
  Formik,
  Form,
  Field,
  FormikHelpers,
  FormikProps,
  FieldProps,
  ErrorMessage,
  FieldInputProps,
  FormikBag,
  FieldMetaProps,
} from 'formik'

import * as Yup from 'yup'

interface AppProps {
  session: MainSessionState
  updateMainSession: typeof updateMainSession
  thunkAuthenticate: typeof thunkAuthenticate
  settings: SessionSettings
  updateSettings: Function
  history: History
}

interface DefaultState {
  jobManagerUrl: string
  jobManagerEmail: string
  jobManagerPassword: string
  submitting: boolean
  s2d2Url: string
  s2d2Verified: boolean
  tileViewerVersion: string
  s2d2Version: string
  jobManagerVerified: boolean
  version: string
}

const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email address format')
    .required('Required.'),
  password: Yup.string()
    .min(3, 'Password must be 3 characters at minimum')
    .required('Required.'),
  url: Yup.string()
    .url('Invalid URL')
    .required('Required.'),
})

declare var VERSION: string

const defaultState = {
  tileViewerVersion: VERSION,
  jobManagerEmail: 'name@email.com',
  submitting: false,
}

interface JobManagerFormValues {
  email: string
  password: string
  url: string
}

class Settings extends Component<AppProps, AppState & DefaultState> {
  constructor(props: AppProps) {
    super(props)
    console.log('settings constructor running')

    this.state = {
      ...defaultState,
      ...this.state,
      jobManagerUrl: props.settings.jobManagerUrl,
      s2d2Url: props.settings.s2d2Url,
      s2d2Verified: null,
      jobManagerVerified: null,
    }
  }

  loginToJobManager = async () => {
    console.log('test call to job manager api goes here')

    const session = { ...this.props.session }

    console.log(session)

    this.props.thunkAuthenticate({
      email: this.state.jobManagerEmail,
      password: this.state.jobManagerPassword,
      url: this.state.jobManagerUrl,
    })

    session.settings.auth.userEmail = this.state.jobManagerEmail
    session.settings.auth.userPassword = this.state.jobManagerPassword
    session.settings.jobManagerUrl = this.state.jobManagerUrl

    this.props.updateMainSession(session)

    // if (result.length !== 0) {
    //   session.settings.jobManagerUrl = this.state.jobManagerUrl
    //   session.csrfTokens.jobManager.key = result
    //   session.csrfTokens.jobManager.updated = Date.now()
    //   this.props.updateMainSession(session)

    //   this.setState({
    //     jobManagerVerified: true,
    //   })
    // } else {
    //   session.csrfTokens.jobManager.key = ''
    //   session.csrfTokens.jobManager.updated = undefined
    //   this.props.updateMainSession(session)
    //   this.setState({
    //     jobManagerVerified: false,Input
    //   })
    // }
  }

  testS2d2Url = async () => {
    console.log('test call to s2d2 api ')
    const result = await getCSRFToken(this.state.s2d2Url)
    console.log('check CSRF result')
    console.log(result)

    const apiversion = await getApiVersion(this.state.s2d2Url)

    const session = { ...this.props.session }
    console.log(session)

    if (result.length !== 0) {
      session.settings.s2d2Url = this.state.s2d2Url
      session.csrfTokens.s2d2.key = result
      session.csrfTokens.s2d2.updated = Date.now()
      this.props.updateMainSession(session)

      this.setState({
        s2d2Verified: true,
        s2d2Version: JSON.parse(apiversion).version,
      })
    } else {
      session.csrfTokens.s2d2.key = ''
      session.csrfTokens.s2d2.updated = undefined
      this.props.updateMainSession(session)

      this.setState({
        s2d2Verified: false,
      })
    }
  }

  updatejobManagerUrl = (event: React.FormEvent<HTMLInputElement>): void => {
    const target = event.currentTarget as HTMLInputElement
    console.log('updating job api url')

    console.log(target.value)
    this.setState({
      jobManagerUrl: target.value,
    })
  }

  updatejobManagerEmail = (event: React.FormEvent<HTMLInputElement>): void => {
    const target = event.currentTarget as HTMLInputElement
    console.log('updating job api user id')

    console.log(target.value)
    this.setState({
      jobManagerEmail: target.value,
    })
  }
  updatejobManagerPassword = (event: React.FormEvent<HTMLInputElement>): void => {
    const target = event.currentTarget as HTMLInputElement
    console.log('updating job api password')

    console.log(target.value)
    this.setState({
      jobManagerPassword: target.value,
    })
  }

  updateS2D2Url = (event: React.FormEvent<HTMLInputElement>): void => {
    console.log('updating s2d2 api url')
    const target = event.currentTarget as HTMLInputElement

    console.log(target.value)
    this.setState({
      s2d2Url: target.value,
    })
  }

  render() {
    const s2d2VerifiedIcon = () => {
      if (this.state.s2d2Verified !== null) {
        if (this.state.s2d2Verified) {
          return (
            <div className="verified flexItem2">
              <FontAwesomeIcon icon={'check'} />
              <span>{'   API version:' + this.state.s2d2Version}</span>
            </div>
          )
        } else {
          return (
            <div className="notVerified flexItem2">
              <FontAwesomeIcon icon={'times'} />
            </div>
          )
        }
      }
    }

    const jobManagerLoginIcon = () => {
      if (this.state.submitting) {
        return (
          <div className="submittingForm flexItem">
            <FontAwesomeIcon icon={'spinner'} className="fa-pulse" />
          </div>
        )
      }

      if (this.state.jobManagerVerified !== null) {
        if (this.state.jobManagerVerified) {
          return (
            <div className="loggingIn flexItem2">
              <FontAwesomeIcon icon={'check'} />
            </div>
          )
        } else {
          return (
            <div className="notVerified flexItem2">
              <FontAwesomeIcon icon={'times'} />
            </div>
          )
        }
      }
    }

    const initialValues: JobManagerFormValues = {
      email: this.props.session.settings.auth.userEmail ? this.props.session.settings.auth.userEmail : '',
      password: this.props.session.settings.auth.userPassword ? this.props.session.settings.auth.userPassword : '',
      url: this.props.session.settings.jobManagerUrl,
    }

    return (
      <div className="pageContainer">
        <div className="leftColumn">
          <button
            onClick={() => {
              console.log('user wants to go to the main screen')
              const { history } = this.props

              const settings = {
                jobManagerUrl: this.state.jobManagerUrl,
                s2d2Url: this.state.s2d2Url,
              }

              this.props.updateSettings(settings)
              history.push('/')
            }}
          >
            Back
          </button>
        </div>
        <div className="main">
          <div className="settings">
            <h1>Settings</h1> <br />
            <h4>Job Manager API</h4>
            <div className="jobManagerApiForm">
              <Formik
                initialValues={initialValues}
                onSubmit={(values, actions) => {
                  console.log({ values, actions })
                  // alert(JSON.stringify(values, null, 2))

                  actions.setSubmitting(true)

                  this.setState(
                    {
                      submitting: true,
                      jobManagerEmail: values.email,
                      jobManagerUrl: values.url,
                      jobManagerPassword: values.password,
                    },
                    () => this.loginToJobManager(),
                  )
                }}
                validationSchema={LoginSchema}
                render={formikBag => (
                  <Form>
                    <FormGroup>
                      <Field
                        name="email"
                        render={({ field, form, meta }: { field: any; form: any; meta: any }) => (
                          <div>
                            <Label for="email">Email</Label>
                            <Input type="text" {...field} name="email" id="email" />
                            <span className="errorMsg">{meta.touched && meta.error && meta.error}</span>
                          </div>
                        )}
                      />
                      <Field
                        name="password"
                        render={({ field, form, meta }: { field: any; form: any; meta: any }) => (
                          <div>
                            <Label for="password">Password</Label>
                            <Input type="password" {...field} name="password" id="password" />
                            <span className="errorMsg">{meta.touched && meta.error && meta.error}</span>
                          </div>
                        )}
                      />
                      <Field
                        name="url"
                        render={({ field, form, meta }: { field: any; form: any; meta: any }) => (
                          <div>
                            <Label for="url">API URL</Label>
                            <Input type="text" {...field} name="url" id="url" />
                            <span className="errorMsg">{meta.touched && meta.error && meta.error}</span>
                          </div>
                        )}
                      />
                    </FormGroup>
                    <div className="buttonAndStatus">
                      <Button type="submit" className="flexItem">
                        Submit
                      </Button>{' '}
                      {jobManagerLoginIcon()}
                    </div>
                  </Form>
                )}
              />
            </div>
            <br />
            <br />
            <br />
            <br />
            <label htmlFor="s2d2_url">S2D2 API Url</label> <br />
            <div className="settingsEntry">
              <input
                id="s2d2_url"
                className="s2d2_url"
                size={50}
                type="text"
                value={this.state.s2d2Url}
                onChange={this.updateS2D2Url}
              />
              <button onClick={this.testS2d2Url}>Verify</button>
              {s2d2VerifiedIcon()}
            </div>
            <br />
            <br />
          </div>
          <div className="about">
            <h1>About</h1>
            <h5>Version: {this.state.tileViewerVersion}</h5>

            <br />
            <div>Design, Development: Shaun Cullen</div>

            <div>Main Application Icon: Fabric by Freepik from www.flaticon.com </div>
            <div>Other Application Icons: Font Awesome</div>
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state: AppState) => ({
  session: state.session,
})

export default connect(
  mapStateToProps,
  {
    updateMainSession,
    thunkAuthenticate,
  },
)(Settings)
