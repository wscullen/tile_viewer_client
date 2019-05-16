import 'react-dates/initialize';

import '../assets/css/App.css'

import React, { Component } from 'react'

import { library } from '@fortawesome/fontawesome-svg-core'
import { fab } from '@fortawesome/free-brands-svg-icons'
import { faCheckSquare, 
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
         faCircle} from '@fortawesome/free-solid-svg-icons'

import {faHourglass as farHourglass,
        faCircle as farCircle} from '@fortawesome/free-regular-svg-icons'

library.add(fab, 
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
            farCircle)


import { MemoryRouter as Router, Switch } from 'react-router-dom';
import { Route } from 'react-router-dom';


import MainContainer from './MainContainer'
import Settings from './Settings'

const defaultSettings = {
  job_url: 'http://hal678772.agr.gc.ca:9090',
  s2d2_url: 'http://hal678772.agr.gc.ca:8000'
}


const renderHomeRoute = () => {
  if (window.location.pathname.includes('index.html')) {
    console.log('index.html found')
     return true;
  } else return false;
};

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      settings: defaultSettings
    }
  }
  
  updateSettings = (updatedSettings) => {
    console.log('updating settings in App.js')
    this.setState({
      settings: updatedSettings
    })
  }

  render() {
    return (
      <Router>
      <Switch>
        <Route exact path="/" render={(props) => <MainContainer {...props} settings={this.state.settings} updateSettings={this.updateSettings}/>} />
        <Route exact path="/settings" render={(props) => <Settings {...props} settings={this.state.settings} updateSettings={this.updateSettings}/>} />
      </Switch>
      </Router>
    )
  }
}

export default App
