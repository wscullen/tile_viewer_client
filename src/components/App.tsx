import 'react-dates/initialize'

import '../assets/css/App.css'

import * as React from 'react'

import { Provider } from 'react-redux'

interface Props {}

interface State {
  settings: SettingsObject
}

interface SettingsObject {
  job_url: string
  s2d2_url: string
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
} from '@fortawesome/free-solid-svg-icons'

import {
  faHourglass as farHourglass,
  faCircle as farCircle,
} from '@fortawesome/free-regular-svg-icons'

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
  faCircle,
  farCircle,
  faCog,
  faEye,
  faEyeSlash
)

import { MemoryRouter as Router, Switch } from 'react-router-dom'
import { Route } from 'react-router-dom'

import MainContainer from './MainContainer'
import Settings from './Settings'

const defaultSettings = {
  job_url: 'http://hal678772.agr.gc.ca:9090',
  s2d2_url: 'http://hal678772.agr.gc.ca:8000',
}

const renderHomeRoute = () => {
  if (window.location.pathname.includes('index.html')) {
    console.log('index.html found')
    return true
  } else return false
}

class App extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    // Check for saved settigns
    const savedSettings = localStorage.getItem('settings')
    console.log(savedSettings)

    this.state = {
      settings:
        savedSettings === null ? defaultSettings : JSON.parse(savedSettings),
    }
  }

  public updateSettings = (updatedSettings: SettingsObject) => {
    console.log('updating settings in App.js')

    localStorage.setItem('settings', JSON.stringify(updatedSettings))

    this.setState({
      settings: updatedSettings,
    })
  }

  public resetSettings = () => {
    console.log('resetting settings to defaults')

    this.setState({
      settings: defaultSettings,
    })
  }

  public render() {
    return (
      <Router>
        <Switch>
          <Route
            exact
            path="/"
            render={(props: Props) => (
              <MainContainer
                {...props}
                settings={this.state.settings}
                updateSettings={this.updateSettings}
                resetSettings={this.resetSettings}
              />
            )}
          />
          <Route
            exact
            path="/settings"
            render={(props: Props) => (
              <Settings
                {...props}
                settings={this.state.settings}
                updateSettings={this.updateSettings}
              />
            )}
          />
        </Switch>
      </Router>
    )
  }
}

export default App
