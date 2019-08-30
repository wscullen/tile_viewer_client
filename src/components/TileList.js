import './../assets/css/TileList.css'

import React, { Component } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import moment from 'moment'
import { renderComponent } from 'recompose'

import AnimateHeight from 'react-animate-height'

import TileListItemCompact from './TileListItemCompact'

import { connect } from 'react-redux'

import { AppState } from '../store/'

import { JobState, Job } from '../store/job/types'

// interface AppProps {
//   jobs: JobState
// }

const defaultState = {
  optionsHide: true,
  height: 0,
}

class TileList extends Component {
  constructor(props) {
    super(props)

    this.state = {
      ...defaultState,
    }
  }

  updateSettings = (settingChanged, e) => {
    console.log(settingChanged)
    console.log(e.target.value)
    const updatedSettings = {}
    if (settingChanged === 'atmosphericCorrection') {
      updatedSettings['atmosphericCorrection'] = e.target.checked
    }

    this.props.updateSettings(updatedSettings)
  }

  toggleTileSettings = () => {
    console.log('Showing tile options')
    this.setState({
      optionsHide: !this.state.optionsHide,
    })
  }

  toggle = () => {
    this.setState({
      optionsHide: !this.state.optionsHide,
    })
  }

  job_verified_icon_l2a = () => {
    let jobProgressIcon = ['far', 'hourglass']
    let jobProgressClass = 'tileActionIndicator disabledIcon'
    if (this.props.sen2agriL2AJob) {
      if (this.props.sen2agriL2AJob.job_status === 'submitted') {
        jobProgressIcon = ['fas', 'hourglass-start']
        jobProgressClass = 'tileActionIndicator grey'
      } else if (this.props.sen2agriL2AJob.job_status === 'assigned') {
        jobProgressIcon = ['fas', 'hourglass-half']
        jobProgressClass = 'tileActionIndicator '
      } else if (this.props.sen2agriL2AJob.job_status === 'completed') {
        jobProgressIcon = ['fas', 'hourglass-end']
        jobProgressClass = 'tileActionIndicator '
      }

      if (this.props.sen2agriL2AJob.job_result === 'success') {
        jobProgressClass += 'jobSuccess'
      } else if (
        this.props.sen2agriL2AJob.job_result === 'failed' &&
        this.props.sen2agriL2AJob.job_status === 'completed'
      ) {
        jobProgressClass += 'jobFailed'
      }

      return (
        <div className={jobProgressClass}>
          <FontAwesomeIcon icon={jobProgressIcon} />
        </div>
      )
    }
  }

  job_verified_icon_l3a = () => {
    let jobProgressIcon = ['far', 'hourglass']
    let jobProgressClass = 'tileActionIndicator disabledIcon'
    if (this.props.sen2agriL3AJob) {
      if (this.props.sen2agriL3AJob.job_status === 'submitted') {
        jobProgressIcon = ['fas', 'hourglass-start']
        jobProgressClass = 'tileActionIndicator grey'
      } else if (this.props.sen2agriL3AJob.job_status === 'assigned') {
        jobProgressIcon = ['fas', 'hourglass-half']
        jobProgressClass = 'tileActionIndicator '
      } else if (this.props.sen2agriL3AJob.job_status === 'completed') {
        jobProgressIcon = ['fas', 'hourglass-end']
        jobProgressClass = 'tileActionIndicator '
      }

      if (this.props.sen2agriL3AJob.job_result === 'success') {
        jobProgressClass += 'jobSuccess'
      } else if (
        this.props.sen2agriL3AJob.job_result === 'failed' &&
        this.props.sen2agriL3AJob.job_status === 'completed'
      ) {
        jobProgressClass += 'jobFailed'
      }

      return (
        <div className={jobProgressClass}>
          <FontAwesomeIcon icon={jobProgressIcon} />
        </div>
      )
    }
  }

  job_verified_icon_l3b = () => {
    let jobProgressIcon = ['far', 'hourglass']
    let jobProgressClass = 'tileActionIndicator disabledIcon'
    if (this.props.sen2agriL3BJob) {
      if (this.props.sen2agriL3BJob.job_status === 'submitted') {
        jobProgressIcon = ['fas', 'hourglass-start']
        jobProgressClass = 'tileActionIndicator grey'
      } else if (this.props.sen2agriL3BJob.job_status === 'assigned') {
        jobProgressIcon = ['fas', 'hourglass-half']
        jobProgressClass = 'tileActionIndicator '
      } else if (this.props.sen2agriL3BJob.job_status === 'completed') {
        jobProgressIcon = ['fas', 'hourglass-end']
        jobProgressClass = 'tileActionIndicator '
      }

      if (this.props.sen2agriL3BJob.job_result === 'success') {
        jobProgressClass += 'jobSuccess'
      } else if (
        this.props.sen2agriL3BJob.job_result === 'failed' &&
        this.props.sen2agriL3BJob.job_status === 'completed'
      ) {
        jobProgressClass += 'jobFailed'
      }

      return (
        <div className={jobProgressClass}>
          <FontAwesomeIcon icon={jobProgressIcon} />
        </div>
      )
    }
  }

  render() {
    console.log(this.props.selectedTilesInList)
    console.log(this.props.settings)

    let dateSectionHeaderClassname = 'dateSection'

    let optionsHeaderClass = 'optionsWrapper'
    optionsHeaderClass += this.state.optionsHide ? ' removed' : ' flexed'
    let currentPlatform = ''

    if (this.props.currentPlatform) {
      if (this.props.currentPlatform === 'sentinel2') {
        currentPlatform = 'Sentinel 2'
      } else if (this.props.currentPlatform === 'landsat8') {
        currentPlatform = 'Landsat 8'
      }
    }

    return (
      <div className="tileList">
        <div className="header">
          <h5 className="sectionLabel title is-5">Tile List - {currentPlatform}</h5>
          <div className="buttonSection">
            <button className="settingsButton" onClick={this.toggle}>
              <FontAwesomeIcon icon="cog" />
            </button>
            <button className="addAreaButton myButton" onClick={() => this.props.submitAllJobs()}>
              Start All
            </button>
          </div>
        </div>
        <div className={optionsHeaderClass}>
          <div className="optionsContent">
            <h4>Job Options</h4>
            <ul>
              <li>
                <input
                  onChange={e => this.updateSettings('atmosphericCorrection', e)}
                  id={this.id}
                  type="checkbox"
                  checked={this.props.settings.atmosphericCorrection}
                />
                <label htmlFor={this.id}>Atmospheric Correction (Sen2Cor/LaSRC)</label>
              </li>
              <li>
                <button onClick={this.props.saveTileJson}>Save Tile List as JSON</button>
              </li>
              <li>
                <button onClick={this.props.copyCurrentTilesToClipboard}>Copy Current Tiles to Clipboard</button>
              </li>
            </ul>
            <h4>Sen2Agri</h4>
            <ul>
              <li>
                <div className="menuItem">
                  <button onClick={this.props.submitSen2agriL2A} disabled={!this.props.enableSen2agriL2A}>
                    Generate Atmos. Corrected (L2A)
                  </button>
                  {this.job_verified_icon_l2a()}
                </div>
              </li>
              <li>
                <div className="menuItem">
                  <button onClick={this.props.submitSen2agriL3A} disabled={!this.props.enableSen2agriL3A}>
                    Generate Cloudfree Composites (L3A)
                  </button>
                  {this.job_verified_icon_l3a()}
                </div>
              </li>
              <li>
                <div className="menuItem">
                  <button onClick={this.props.submitSen2agriL3B} disabled={!this.props.enableSen2agriL3B}>
                    Generate LAI/NDVI For Each Date (L3B)
                  </button>
                  {this.job_verified_icon_l3b()}
                </div>
              </li>
            </ul>
          </div>
        </div>
        <div className="listOfTiles">
          <div className="listWrapper">
            <ul>
              {Object.keys(this.props.selectedTiles).map(d => {
                const listElements = []

                if (this.props.selectedTiles[d].length > 0) {
                  const headerEle = (
                    <li
                      className={dateSectionHeaderClassname}
                      onClick={() => this.props.dateClicked(moment(d).format('YYYYMMDD'))}
                      key={d}
                    >
                      {moment(d).format('MMMM DD YYYY')}
                    </li>
                  )
                  listElements.push(headerEle)
                  let counter = 0
                  for (const tile of this.props.selectedTiles[d]) {
                    let clsName = 'tileListItem'

                    if (this.props.selectedTilesInList.includes(tile.id)) {
                      clsName = 'tileListItem activeSelection'
                    }

                    if (counter % 2 === 0) {
                      clsName += ' altBackground'
                    }

                    counter++

                    let job

                    if (tile.jobs.length > 0) {
                      console.log('tile has jobs')
                      const lastJobId = tile.jobs[tile.jobs.length - 1]

                      job = this.props.jobs.byId[lastJobId]

                      console.log('most recent job for tile')
                      console.log(job)
                    }

                    const tileEle = (
                      <li
                        className={clsName}
                        key={tile.properties.name}
                        name={tile.properties.name}
                        onClick={event => this.props.tileClicked(event, tile.id)}
                      >
                        <TileListItemCompact
                          tile={tile}
                          job={job}
                          removeTile={this.props.removeTile}
                          toggleVisibility={this.props.toggleTileVisibility}
                          resubmitLastJob={this.props.resubmitLastJob}
                        />
                      </li>
                    )
                    listElements.push(tileEle)
                  }
                }
                return listElements
              })}
            </ul>
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  jobs: state.job,
})

export default connect(
  mapStateToProps,
  {

  },
)(TileList)
