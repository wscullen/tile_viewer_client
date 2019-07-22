import './../assets/css/Settings.css'

import React, { Component } from 'react'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const defaultState = {
  job_url: ''
}

export default class Settings extends Component {
  constructor (props) {
    super(props)
    console.log('settings constructor running')

    this.state = {
      job_url: props.settings.job_url,
      s2d2_url: props.settings.s2d2_url,
      s2d2_verified: null,
      job_verified: null
    }
  }

    testJobUrl = () => {
      console.log('test call to job manager api goes here')
      fetch(`${this.state.job_url}/generate_csrf/`, {
        method: 'GET',
        mode: 'cors',
        cache: 'default'
      }).then(response => response.json())
        .then(response => {
          console.log('Success:', JSON.stringify(response))
          this.setState({
            job_verified: true
          })
        })
        .catch(error => {
          this.setState({
            job_verified: false
          })
          console.error('Error:', error)
        })
    }

    updateJobUrl = (event) => {
      console.log('updating job api urlssss')

      console.log(event.target.value)
      this.setState({
        job_url: event.target.value
      })
    }

    testS2D2Url = () => {
      console.log('test call to  S2d2 api goes here')

      fetch(`${this.state.s2d2_url}/generate_csrf/`, {
        method: 'GET',
        mode: 'cors',
        cache: 'default'
      }).then(response => response.json())
        .then(response => {
          console.log('Success:', JSON.stringify(response))
          this.setState({
            s2d2_verified: true
          })
        })
        .catch(error => {
          this.setState({
            s2d2_verified: false
          })
          console.error('Error:', error)
        })
    }

    updateS2D2Url = (event) => {
      console.log('updating job api url')

      console.log(event.target.value)
      this.setState({
        s2d2_url: event.target.value
      })
    }

    render () {
      const s2d2_verified_icon = () => {
        if (this.state.s2d2_verified !== null) {
          if (this.state.s2d2_verified) {
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

      const job_verified_icon = () => {
        if (this.state.job_verified !== null) {
          if (this.state.job_verified) {
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
                job_url: this.state.job_url,
                s2d2_url: this.state.s2d2_url
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

                <input id='job_url' className='job_url' size='50' type='text' value={this.state.job_url} onChange={this.updateJobUrl} />
                <button onClick={this.testJobUrl}>Verify</button>
                {job_verified_icon()}
              </div>
              <label htmlFor='s2d2_url'>S2D2 API Url</label> <br />

              <div className='settingsEntry'>
                <input id='s2d2_url' className='s2d2_url' size='50' type='text' value={this.state.s2d2_url} onChange={this.updateS2D2Url} />
                <button onClick={this.testS2D2Url}>Verify</button>
                {s2d2_verified_icon()}
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
