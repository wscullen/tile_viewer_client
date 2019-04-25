import 'react-dates/initialize';

import '../assets/css/App.css'
import React, { Component } from 'react'

import { library } from '@fortawesome/fontawesome-svg-core'
import { fab } from '@fortawesome/free-brands-svg-icons'
import { faCheckSquare, faCoffee, faPlus, faWindowClose } from '@fortawesome/free-solid-svg-icons'

library.add(fab, faCheckSquare, faCoffee, faPlus, faWindowClose )

import MainContainer from './MainContainer'

class App extends React.Component {
  render() {
    return (
      <MainContainer />
    )
  }
}

export default App
