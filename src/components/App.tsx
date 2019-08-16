import 'react-dates/initialize'

import '../assets/css/App.css'

import * as React from 'react'

import { MemoryHistory } from 'history'
import { RouteProps, RouteComponentProps } from 'react-router'

import { connect } from 'react-redux'
import { AppState } from '../store/'

import { MainSessionState, SessionSettings } from '../store/session/types'
import { updateMainSession } from '../store/session/actions'

interface Props {
  history: MemoryHistory
}

import { library } from '@fortawesome/fontawesome-svg-core'
import { fab } from '@fortawesome/free-brands-svg-icons'
import {
  faCheckSquare,
  faCoffee,
  faPlus,
  faWindowClose,
  faArrowRight,
  faArrowLeft,
  faTimes,
  faTimesCircle,
  faHammer,
  faInfo,
  faRedoAlt,
  faDownload,
  faCheck,
  faHourglass,
  faHourglassStart,
  faHourglassHalf,
  faHourglassEnd,
  faCircle,
  faCog,
  faEye,
  faEyeSlash,
  faGlobeAmericas,
  faInfoCircle,
  faToolbox,
} from '@fortawesome/free-solid-svg-icons'

import { faHourglass as farHourglass, faCircle as farCircle } from '@fortawesome/free-regular-svg-icons'

// @ts-ignore
library.add(
  fab,
  faCheckSquare,
  faCoffee,
  faPlus,
  faWindowClose,
  faArrowRight,
  faArrowLeft,
  faTimes,
  faTimesCircle,
  faInfo,
  faRedoAlt,
  faDownload,
  faCheck,
  faHourglass,
  farHourglass,
  faHourglassStart,
  faHourglassHalf,
  faHourglassEnd,
  faInfoCircle,
  faGlobeAmericas,
  faCircle,
  farCircle,
  faCog,
  faEye,
  faEyeSlash,
  faToolbox,
)

import { MemoryRouter as Router, Switch } from 'react-router-dom'
import { Route } from 'react-router-dom'

import MainContainer from './MainContainer'
import Settings from './Settings'

const defaultSettings: SessionSettings = {
  jobManagerUrl: 'http://hal678772.agr.gc.ca:9090',
  s2d2Url: 'http://hal678772.agr.gc.ca:8000',
}

const renderHomeRoute = () => {
  if (window.location.pathname.includes('index.html')) {
    console.log('index.html found')
    return true
  } else return false
}


class App extends React.Component<any, any> {
  constructor(props: any) {
    super(props)
    // Check for saved settigns

  }

  public updateSettings = (updatedSettings: SessionSettings): void => {
    console.log('updating settings in App.js')
    const currentSession = { ...this.props.session }
    currentSession.settings = updatedSettings
    this.props.updateMainSession(currentSession)
  }

  public resetSettings = (): void => {
    console.log('resetting settings to defaults')
    const currentSession = { ...this.props.session }
    currentSession.settings = defaultSettings
    this.props.updateMainSession(currentSession)
  }

  public render() {
    return (
      <Router>
        <Switch>
          <Route
            exact
            path="/"
            render={(props: RouteComponentProps) => (
              <MainContainer
                {...props}
                settings={this.props.session.settings}
                updateSettings={this.updateSettings}
                resetSettings={this.resetSettings}
              />
            )}
          />
          <Route
            exact
            path="/settings"
            render={(props: RouteComponentProps) => (
              <Settings {...props} settings={this.props.session.settings} updateSettings={this.updateSettings} />
            )}
          />
        </Switch>
      </Router>
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
)(App)
