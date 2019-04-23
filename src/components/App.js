import '../assets/css/App.css'
import React, { Component } from 'react'

import MainContainer from './MainContainer'


class App extends React.Component {
  render() {
    return (
      <div>
        <h1>Hello, Electron!</h1>

        <p>I hope you enjoy using basic-electron-react-boilerplate to start your dev off right!</p>
        <MainContainer />
      </div>
    )
  }
}

export default App
