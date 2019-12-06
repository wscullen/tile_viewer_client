import './../assets/css/TileList.scss'

import React, { Component } from 'react'
import moment from 'moment'

import { Icon, Button, Checkbox } from 'semantic-ui-react'

import TileListItemCompact from './TileListItemCompact'

import { connect } from 'react-redux'

import { AppState } from '../store/'

import { JobState, Job, JobStatus } from '../store/job/types'

import { AoiSettings, SingleDateTileList } from '../store/aoi/types'
import { JobObject } from './MainContainer'

interface AppProps {
  jobs: JobState
  currentAoi: string
  updateSettings: Function
  sen2agriL2AJob: JobObject
  sen2agriL3AJob: JobObject
  sen2agriL3BJob: JobObject
  selectedTilesInList: string[]
  settings: AoiSettings
  currentPlatform: string
  submitAllJobs: Function
  saveTileJson: Function
  copyCurrentTilesToClipboard: Function
  submitSen2agriL2A: Function
  submitSen2agriL3A: Function
  submitSen2agriL3B: Function
  enableSen2agriL2A: boolean
  enableSen2agriL3A: boolean
  enableSen2agriL3B: boolean
  selectedTiles: SingleDateTileList
  dateClicked: Function
  tileClicked: Function
  removeTile: Function
  toggleTileVisibility: Function
  resubmitLastJob: Function
}

interface DefaultAppState {
  optionsHide: boolean
  height: number
}

const defaultState: DefaultAppState = {
  optionsHide: true,
  height: 0,
}

class TileList extends Component<AppProps, DefaultAppState> {
  constructor(props: AppProps) {
    super(props)

    this.state = {
      ...defaultState,
    }
  }

  componentWillReceiveProps(nextProps: AppProps) {
    if (nextProps.currentAoi === '' && !this.state.optionsHide) {
      this.toggle()
    }
  }

  updateSettings = (settingChanged: string, e: any) => {
    console.log(settingChanged)
    console.log(e.target.value)
    const updatedSettings: AoiSettings = {
      atmosphericCorrection: null,
    }
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

  // job_verified_icon_l2a = () => {
  //   let jobProgressIcon = 'hourglass outline'
  //   let jobProgressClass = 'tileActionIndicator disabledIcon'
  //   if (this.props.sen2agriL2AJob) {
  //     if (this.props.sen2agriL2AJob.status === JobStatus.Submitted) {
  //       jobProgressIcon = 'hourglass start'
  //       jobProgressClass = 'tileActionIndicator grey'
  //     } else if (this.props.sen2agriL2AJob.status === JobStatus.Assigned) {
  //       jobProgressIcon = 'hourglass half'
  //       jobProgressClass = 'tileActionIndicator '
  //     } else if (this.props.sen2agriL2AJob.status === JobStatus.Completed) {
  //       jobProgressIcon = 'hourglass end'
  //       jobProgressClass = 'tileActionIndicator '
  //     }

  //     if (this.props.sen2agriL2AJob.success) {
  //       jobProgressClass += 'jobSuccess'
  //     } else if (!!!this.props.sen2agriL2AJob.success && this.props.sen2agriL2AJob.status === JobStatus.Completed) {
  //       jobProgressClass += 'jobFailed'
  //     }

  //     return (
  //       <div className={jobProgressClass}>
  //         <Icon type={jobProgressIcon} />
  //       </div>
  //     )
  //   }
  // }

  // job_verified_icon_l3a = () => {
  //   let jobProgressIcon = 'hourglass outline'
  //   let jobProgressClass = 'tileActionIndicator disabledIcon'
  //   if (this.props.sen2agriL3AJob) {
  //     if (this.props.sen2agriL3AJob.status === JobStatus.Submitted) {
  //       jobProgressIcon = 'hourglass start'
  //       jobProgressClass = 'tileActionIndicator grey'
  //     } else if (this.props.sen2agriL3AJob.status === JobStatus.Assigned) {
  //       jobProgressIcon = 'hourglass half'
  //       jobProgressClass = 'tileActionIndicator '
  //     } else if (this.props.sen2agriL3AJob.status === JobStatus.Completed) {
  //       jobProgressIcon = 'hourglass end'
  //       jobProgressClass = 'tileActionIndicator '
  //     }

  //     if (this.props.sen2agriL3AJob.success) {
  //       jobProgressClass += 'jobSuccess'
  //     } else if (!!!this.props.sen2agriL3AJob.success && this.props.sen2agriL3AJob.status === JobStatus.Completed) {
  //       jobProgressClass += 'jobFailed'
  //     }

  //     return (
  //       <div className={jobProgressClass}>
  //         <Icon type={jobProgressIcon} />
  //       </div>
  //     )
  //   }
  // }

  // job_verified_icon_l3b = () => {
  //   let jobProgressIcon = 'hourglass outline'
  //   let jobProgressClass = 'tileActionIndicator disabledIcon'
  //   if (this.props.sen2agriL3BJob) {
  //     if (this.props.sen2agriL3BJob.status === JobStatus.Submitted) {
  //       jobProgressIcon = 'hourglass start'
  //       jobProgressClass = 'tileActionIndicator grey'
  //     } else if (this.props.sen2agriL3BJob.status === JobStatus.Assigned) {
  //       jobProgressIcon = 'hourglass half'
  //       jobProgressClass = 'tileActionIndicator '
  //     } else if (this.props.sen2agriL3BJob.status === JobStatus.Completed) {
  //       jobProgressIcon = 'hourglass end'
  //       jobProgressClass = 'tileActionIndicator '
  //     }

  //     if (this.props.sen2agriL3BJob.success) {
  //       jobProgressClass += 'jobSuccess'
  //     } else if (!!!this.props.sen2agriL3BJob.success && this.props.sen2agriL3BJob.status === JobStatus.Completed) {
  //       jobProgressClass += 'jobFailed'
  //     }

  //     return (
  //       <div className={jobProgressClass}>
  //         <Icon type={jobProgressIcon} />
  //       </div>
  //     )
  //   }
  // }

  render() {
    console.log('Tile List -----')
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
          <h5 className="sectionLabel title is-5">Tiles {currentPlatform !== '' ? '- ' + currentPlatform : ''}</h5>
          <div className="buttonSection">
            <Button
              icon
              onClick={e =>
                this.props.currentAoi !== '' ? this.toggle() : console.log('No Aoi Selected, not showing options')
              }
            >
              <Icon name="cog" />
            </Button>
            <Button color="green" onClick={() => this.props.submitAllJobs()}>
              {this.props.selectedTilesInList.length === 0 ? 'Start All' : 'Start Highlighted'}
            </Button>
          </div>
        </div>
        <div className={optionsHeaderClass}>
          <div className="optionsContent">
            <h4>Job Options</h4>
            <ul>
              <li>
                <Checkbox
                  label="Atmospheric Correction (Sen2Cor/LaSRC)"
                  onChange={e => this.updateSettings('atmosphericCorrection', e)}
                />
              </li>
              <li>
                <Button onClick={e => this.props.saveTileJson()}>Save Tile List as JSON</Button>
              </li>
              <li>
                <Button onClick={e => this.props.copyCurrentTilesToClipboard()}>
                  {this.props.selectedTilesInList.length === 0
                    ? 'Copy Current Platform Tiles to Clipboard'
                    : 'Copy HIGHLIGHTED Current Platform Tiles to Clipboard'}
                </Button>
              </li>
            </ul>
            <h4>Sen2Agri</h4>
            <ul>
              <li>
                <div className="menuItem">
                  <button onClick={e => this.props.submitSen2agriL2A()} disabled={!this.props.enableSen2agriL2A}>
                    Generate Atmos. Corrected (L2A)
                  </button>
                  {/* {this.job_verified_icon_l2a()} */}
                </div>
              </li>
              <li>
                <div className="menuItem">
                  <button onClick={e => this.props.submitSen2agriL3A()} disabled={!this.props.enableSen2agriL3A}>
                    Generate Cloudfree Composites (L3A)
                  </button>
                  {/* {this.job_verified_icon_l3a()} */}
                </div>
              </li>
              <li>
                <div className="menuItem">
                  <button onClick={e => this.props.submitSen2agriL3B()} disabled={!this.props.enableSen2agriL3B}>
                    Generate LAI/NDVI For Each Date (L3B)
                  </button>
                  {/* {this.job_verified_icon_l3b()} */}
                </div>
              </li>
            </ul>
          </div>
        </div>
        <div className="listOfTiles">
          <div className="listWrapper">
            <ul>
              {Object.keys(this.props.selectedTiles).map((d: string) => {
                const listElements = []
                console.log(d)
                //@ts-ignore
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

const mapStateToProps = (state: AppState) => ({
  jobs: state.job,
})

export default connect(
  mapStateToProps,
  {},
)(TileList)
