import './../assets/css/Updater.scss'

import React, { Component } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { MainSessionState, Token, SessionSettings } from '../store/session/types'
import { getCSRFToken } from '../store/session/thunks'
import { updateMainSession } from '../store/session/actions'
import { connect } from 'react-redux'
import { AppState } from '../store/'

import { History } from 'history'
import { thisExpression } from '@babel/types'
import { IpcMessageEvent } from 'electron'

const { ipcRenderer } = require('electron')

interface AppProps {
  session: MainSessionState
  updateMainSession: typeof updateMainSession
  history: History
}

interface DefaultState {
  updateAvailable: boolean
  currentVersion: string
  availableVersion: string
  downloadedSize: number
  totalDownloadSize: number
  downloadProgressPercent: number
  currentMessage: string
  os: string
}

const defaultState = {
  updateAvailable: false,
  currentVersion: '',
  availableVersion: '',
  downloadedSize: -1,
  totalDownloadSize: -1,
  downloadProgressPercent: -1,
  currentMessage: '',
}

interface IpcMessageStructure {
  type: string
  payload: string
}

class Updater extends Component<AppProps, AppState & DefaultState> {
  constructor(props: AppProps) {
    super(props)
    console.log('settings constructor running')

    ipcRenderer.on('updaterMessage', (event: IpcMessageEvent, arg: IpcMessageStructure) => {
      console.log(arg) // prints "pong"

      if (arg.type === 'versionMessage') {
        this.setState({
          currentVersion: arg.payload,
        })
      } else if (arg.type === 'statusMessage') {
        const updateAvailable = arg.payload === 'Update available.'
        console.log(updateAvailable)
        this.setState({
          currentMessage: arg.payload,
          updateAvailable,
        })
      } else if (arg.type === 'availableVersionMessage') {
        const payloadObj = JSON.parse(arg.payload)

        this.setState({
          availableVersion: 'v' + payloadObj.version,
          os: payloadObj.os,
        })
      } else if (arg.type === 'downloadProgress') {
        const progressObj = JSON.parse(arg.payload)
        console.log(progressObj)

        this.setState({
          downloadProgressPercent: progressObj.percent,
          downloadedSize: progressObj.transferred,
          totalDownloadSize: progressObj.total,
        })
      }

      // log_message = log_message + ' - Downloaded ' + progressObj.percent + '%'
      // log_message = log_message + ' (' + progressObj.transferred + '/' + progressObj.total + ')'
      // sendStatusToWindow('Downloading...')
    })

    this.state = {
      ...defaultState,
      ...this.state,
    }
  }

  startUpdate = (userWantsUpdate: boolean) => {
    console.log(userWantsUpdate)

    if (userWantsUpdate) {
      ipcRenderer.send('asynchronous-message', {
        type: 'update',
        payload: true,
      })
    } else {
      ipcRenderer.send('asynchronous-message', {
        type: 'update',
        payload: false,
      })
    }
  }

  startDownload = () => {
    if (this.state.os === 'linux') {
      this.setState({
        currentMessage: 'Downloading...',
      })
    }

    ipcRenderer.send('updaterMessage', {
      type: 'updateControl',
      payload: 'download',
    })
  }

  installAndRestart = () => {
    ipcRenderer.send('updaterMessage', {
      type: 'updateControl',
      payload: 'installAndRestart',
    })
  }

  renderDynamicContent = () => {
    if (this.state.currentMessage === 'Update available.') {
      return <button onClick={() => this.startDownload()}>Download Update</button>
    } else if (this.state.currentMessage === 'Downloading...') {
      if (this.state.os === 'linux') {
        return (
          <div>
            <progress className="progress is-small is-primary" max="100"></progress>
          </div>
        )
      } else {
        return (
          <div>
            <progress
              className="progress is-small is-primary"
              value={this.state.downloadProgressPercent}
              max="100"
            ></progress>
            ({(this.state.downloadedSize / 1048576).toPrecision(2)}/
            {(this.state.totalDownloadSize / 1048576).toPrecision(2)})
          </div>
        )
      }
    } else if (this.state.currentMessage === 'Update downloaded.') {
      return <button onClick={() => this.installAndRestart()}>Install Update and Restart</button>
    }
  }

  render() {
    return (
      <div className="container">
        <div className="main">
          <h5>Current Version:</h5>
          <p>{this.state.currentVersion}</p>
          <h5>Available Version:</h5>
          <p>{this.state.availableVersion}</p>
          <p>{this.state.currentMessage}</p>
          <div>{this.renderDynamicContent()}</div>
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
)(Updater)
