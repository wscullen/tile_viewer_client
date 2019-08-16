import './../assets/css/Settings.css'

import React, { Component } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { MainSessionState, Token, SessionSettings } from '../store/session/types'
import { getCSRFToken } from '../store/session/thunks'
import { updateMainSession } from '../store/session/actions'
import { connect } from 'react-redux'
import { AppState } from '../store/'

import { History } from 'history'
import { thisExpression } from '@babel/types';

interface AppProps {
  session: MainSessionState
  updateMainSession: typeof updateMainSession
  settings: SessionSettings
  updateSettings: Function
  history: History
}

interface DefaultState {
  jobManagerUrl: string
  s2d2Url: string
  s2d2Verified: boolean
  jobManagerVerified: boolean
}

const defaultState = {

}

class Settings extends Component<AppProps, AppState & DefaultState> {
  constructor (props: AppProps) {
    super(props)
    console.log('settings constructor running')

    this.state = {
      ...this.state,
      jobManagerUrl: props.settings.jobManagerUrl,
      s2d2Url: props.settings.s2d2Url,
      s2d2Verified: null,
      jobManagerVerified: null
    }
  }

    testjobManagerUrl = async () => {
      console.log('test call to job manager api goes here')
      const result = await getCSRFToken(this.state.jobManagerUrl)
      console.log('check CSRF result')
      console.log(result)

      const session = { ...this.props.session }

      console.log(session)

      if (result.length !== 0) {
        session.settings.jobManagerUrl = this.state.jobManagerUrl
        session.csrfTokens.jobManager.key = result
        session.csrfTokens.jobManager.updated = Date.now()
        this.props.updateMainSession(session)

        this.setState({
          jobManagerVerified: true
        })
      }  else {
        session.csrfTokens.jobManager.key = ""
        session.csrfTokens.jobManager.updated = undefined
        this.props.updateMainSession(session)
        this.setState({
          jobManagerVerified: false
        })
      }
    }

    testS2d2Url = async () => {
      console.log('test call to s2d2 api ')
      const result = await getCSRFToken(this.state.s2d2Url)
      console.log('check CSRF result')
      console.log(result)

      const session = { ...this.props.session }
      console.log(session)

      if (result.length !== 0) {
        session.settings.s2d2Url = this.state.s2d2Url
        session.csrfTokens.s2d2.key = result
        session.csrfTokens.s2d2.updated = Date.now()
        this.props.updateMainSession(session)

        this.setState({
          s2d2Verified: true
        })
      } else {
        session.csrfTokens.s2d2.key = ""
        session.csrfTokens.s2d2.updated = undefined
        this.props.updateMainSession(session)

        this.setState({
          s2d2Verified: false
        })
      }
    }

    updatejobManagerUrl = (event: React.FormEvent<HTMLInputElement>): void => {
      const target = event.currentTarget as HTMLInputElement
      console.log('updating job api url')

      console.log(target.value)
      this.setState({
        jobManagerUrl: target.value
      })
    }

    updateS2D2Url = (event: React.FormEvent<HTMLInputElement>): void => {
      console.log('updating s2d2 api url')
      const target = event.currentTarget as HTMLInputElement

      console.log(target.value)
      this.setState({
        s2d2Url: target.value
      })
    }

    render () {
      const s2d2VerifiedIcon = () => {
        if (this.state.s2d2Verified !== null) {
          if (this.state.s2d2Verified) {
            return (<div className='verified flexItem2'>
              <FontAwesomeIcon icon={'check'} />
            </div>)
          } else {
            return (<div className='notVerified flexItem2'>
              <FontAwesomeIcon icon={'times'} />
            </div>)
          }
        }
      }

      const jobManagerVerifiedIcon = () => {
        if (this.state.jobManagerVerified !== null) {
          if (this.state.jobManagerVerified) {
            return (<div className='verified flexItem2'>
              <FontAwesomeIcon icon={'check'} />
            </div>)
          } else {
            return (<div className='notVerified flexItem2'>
              <FontAwesomeIcon icon={'times'} />
            </div>)
          }
        }
      }

      return (

        <div className='pageContainer'>
          <div className='leftColumn'>
            <button onClick={() => {
              console.log('user wants to go to the main screen')
              const { history } = this.props

              const settings = {
                jobManagerUrl: this.state.jobManagerUrl,
                s2d2Url: this.state.s2d2Url,
              }

              this.props.updateSettings(settings)
              history.push('/')
            }
            }>Back</button>
          </div>
          <div className='main'>
            <div className='settings'>
              <h1>Settings</h1> <br />
              <label htmlFor='job_url'>Job Manager API Url</label> <br />
              <div className='settingsEntry'>
                <input id='job_url' className='job_url' size={50} type='text' value={this.state.jobManagerUrl} onChange={this.updatejobManagerUrl} />
                <button onClick={this.testjobManagerUrl}>Verify</button>
                {jobManagerVerifiedIcon()}
              </div>
              <label htmlFor='s2d2_url'>S2D2 API Url</label> <br />

              <div className='settingsEntry'>
                <input id='s2d2_url' className='s2d2_url' size={50} type='text' value={this.state.s2d2Url} onChange={this.updateS2D2Url} />
                <button onClick={this.testS2d2Url}>Verify</button>
                {s2d2VerifiedIcon()}
              </div>
              <br />
              <br />

            </div>
            <div className='credits'>
              <h1>Credits</h1><br />
              <p> Design, Development: Shaun Cullen</p>

              <p>Main Application Icon: Fabric by Freepik from www.flaticon.com </p>
              <p>Other Application Icons: Font Awesome</p>

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
  },
)(Settings)
