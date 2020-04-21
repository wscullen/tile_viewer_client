import './../assets/css/Settings.scss'

import React, { Component } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { MainSessionState, Token, SessionSettings, UPDATE_LOGIN_FORM } from '../store/session/types'
import { getCSRFToken, getApiVersion, thunkAuthenticate, thunkAttemptLogin } from '../store/session/thunks'
import { updateMainSession, updateLoginForm } from '../store/session/actions'
import { connect } from 'react-redux'
import { AppState } from '../store/'

import { History } from 'history'

import { Button, Checkbox, Form, Message } from 'semantic-ui-react'

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

import * as Yup from 'yup'

interface AppProps {
  session: MainSessionState
  updateMainSession: typeof updateMainSession
  thunkAuthenticate: typeof thunkAuthenticate
  thunkAttemptLogin: typeof thunkAttemptLogin
  updateLoginForm: typeof updateLoginForm
  history: History
}

interface DefaultState {
  jobManagerUrl: string
  jobManagerEmail: string
  jobManagerPassword: string
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
      jobManagerUrl: this.props.session.settings.jobManagerUrl,
      s2d2Verified: null,
      jobManagerVerified: null,
    }
  }

  loginToJobManager = async () => {
    console.log('test call to job manager api goes here')

    const session = { ...this.props.session }

    console.log(session)

    let result = this.props.thunkAttemptLogin({
      email: this.state.jobManagerEmail,
      password: this.state.jobManagerPassword,
      url: this.state.jobManagerUrl,
    })

    console.log('thunk result', result)
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

    const initialValues: JobManagerFormValues = {
      email: this.props.session.settings.auth.userEmail ? this.props.session.settings.auth.userEmail : '',
      password: this.props.session.settings.auth.userPassword ? this.props.session.settings.auth.userPassword : '',
      url: this.props.session.settings.jobManagerUrl,
    }

    return (
      <div className="pageContainer">
        <div className="leftColumn">
          <Button
            icon="arrow left"
            onClick={() => {
              console.log('user wants to go to the main screen')
              const { history } = this.props

              const settings = {
                jobManagerUrl: this.state.jobManagerUrl,
                s2d2Url: this.state.s2d2Url,
              }
              const newLoginFormStatus = {
                success: false,
                msg: '',
              }

              this.props.updateLoginForm(newLoginFormStatus)
              history.push('/')
            }}
          />
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
                  const newLoginFormStatus = {
                    success: false,
                    finished: false,
                    msg: 'Attempting to login...',
                    submitting: true,
                  }

                  this.props.updateLoginForm(newLoginFormStatus)
                  this.setState(
                    {
                      jobManagerEmail: values.email,
                      jobManagerUrl: values.url,
                      jobManagerPassword: values.password,
                    },
                    () => this.loginToJobManager(),
                  )
                }}
                validationSchema={LoginSchema}
                >
                  {({ values, handleSubmit, setFieldValue, setFieldTouched, errors, touched, validateField, validateForm, resetForm }) => {
                  return (
                  <div>
                    <Form loading={this.props.session.forms.login.submitting} onSubmit={handleSubmit}>
                      <FormikField name="email">
                        {
                          ({ field, form, meta }: { field: any; form: any; meta: any }) => (
                            <Form.Input 
                              {...field}
                              label="Email"
                              id="email"
                              error={meta.touched && meta.error && meta.error}
                              name="email" />)
                        }
                      </FormikField>
                      <FormikField name="password">
                        {
                          ({ field, form, meta }: { field: any; form: any; meta: any }) => (
                            <Form.Input 
                              {...field}
                              type="password"
                              label="Password"
                              id="password"
                              error={meta.touched && meta.error && meta.error}
                              name="password" />)
                        }
                      </FormikField>
                      <FormikField name="url">
                        {
                          ({ field, form, meta }: { field: any; form: any; meta: any }) => (
                            <Form.Input 
                              {...field}
                              label="API Url"
                              id="url"
                              error={meta.touched && meta.error && meta.error}
                              name="url" />)
                        }
                      </FormikField>
                      <Button type="submit" className="flexItem" primary>
                        Login
                      </Button>
                    </Form>
                    <Message
                      hidden={this.props.session.forms.login.msg === ''}
                      positive={this.props.session.forms.login.finished && this.props.session.forms.login.success}
                      negative={this.props.session.forms.login.finished && !this.props.session.forms.login.success}
                    >
                      <p>{this.props.session.forms.login.msg}</p>
                    </Message>
                  </div>)
                  }
                }
              </Formik>
            </div>
          </div>
          <div className="about">
            <h1>About</h1>
            <br />
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
    updateLoginForm,
    thunkAuthenticate,
    thunkAttemptLogin,
  },
)(Settings)
