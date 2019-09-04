import './../assets/css/Updater.css'

import React, { Component } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { MainSessionState, Token, SessionSettings } from '../store/session/types'
import { getCSRFToken } from '../store/session/thunks'
import { updateMainSession } from '../store/session/actions'
import { connect } from 'react-redux'
import { AppState } from '../store/'

import { History } from 'history'
import { thisExpression } from '@babel/types';
import { IpcMessageEvent } from 'electron';


const { ipcRenderer } = require('electron')

interface AppProps {
  session: MainSessionState
  updateMainSession: typeof updateMainSession
  settings: SessionSettings
  updateSettings: Function
  history: History
}

interface DefaultState {
  updateAvailable: boolean
  currentVersion: string
  availableVersion: string
  totalDownloadSize: number
  downloadProgress: number
  currentMessage: string
}

const defaultState = {
  updateAvailable: false,
  currentVersion: "",
  availableVersion: "",
  totalDownloadSize: -1,
  downloadProgress: -1,
  currentMessage: "",
}

interface IpcMessageStructure {
  type: string
  payload: string
}

class Updater extends Component<AppProps, AppState & DefaultState> {
  constructor (props: AppProps) {
    super(props)
    console.log('settings constructor running')

    ipcRenderer.on('updaterMessage', (event: IpcMessageEvent, arg: IpcMessageStructure) => {
      console.log(arg) // prints "pong"

      if (arg.type === 'versionMessage') {
        this.setState({
          currentVersion: arg.payload
        })
      } else if (arg.type === 'statusMessage') {
        const updateAvailable = arg.payload === 'Update available.'

        this.setState({
          currentMessage: arg.payload,
          updateAvailable
        })
      } else if (arg.type === 'availableVersionMessage') {
        this.setState({
          availableVersion: 'v' + arg.payload
        })
      }


    })

    this.state = {
      ...defaultState,
      ...this.state
    }
  }

  startUpdate = (userWantsUpdate: boolean)  => {
    console.log(userWantsUpdate)

    if (userWantsUpdate) {
      ipcRenderer.send('asynchronous-message', {
        type: 'update',
        payload: true
      })
    } else {
      ipcRenderer.send('asynchronous-message', {
        type: 'update',
        payload: false
      })
    }
  }

  renderDynamicContent = () => {
    if (this.state.updateAvailable) {
      return (
        <button>Update</button>
      )
    }
  }

    render () {
      return (

        <div className='container'>
          <div className='main'>
            <h5>Current Version:</h5>
            <p>{this.state.currentVersion}</p>
            <h5>Available Version:</h5>
            <p>{this.state.availableVersion}</p>
            <p>{this.state.currentMessage}</p>
            <p>{this.renderDynamicContent}</p>
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
