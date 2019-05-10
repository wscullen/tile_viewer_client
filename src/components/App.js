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

import MainContainer from './MainContainer'

class App extends React.Component {
  render() {
    return (
      <MainContainer />
    )
  }
}

export default App
