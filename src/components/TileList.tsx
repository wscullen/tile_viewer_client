import './../assets/css/TileList.scss'

import React, { Component } from 'react'
import moment from 'moment'

import { Icon, Button, Checkbox, Popup, Grid, Header, Progress, Segment, Divider } from 'semantic-ui-react'

import TileListItemCompact from './TileListItemCompact'

import { connect } from 'react-redux'

import { AppState } from '../store/'

import { JobState, Job, JobStatus, TaskStatus, JobInfoObject } from '../store/job/types'
import { Session } from '../store/aoi/types'

import { AoiSettings, SingleDateTileList } from '../store/aoi/types'
import { JobObject } from './MainContainer'

interface AppProps {
  jobs: JobState
  currentSession: Session
  currentAoi: string
  updateSettings: Function
  selectedTilesInList: string[]
  settings: AoiSettings
  currentPlatform: string
  submitAllJobs: Function
  saveTileJson: Function
  copyCurrentTilesToClipboard: Function
  selectedTiles: SingleDateTileList
  dateClicked: Function
  tileClicked: Function
  removeTile: Function
  toggleTileVisibility: Function
  resubmitLastJob: Function
  switchToSen2AgriPanel: Function
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

  updateAtmosphericCorrection = (event: React.FormEvent<HTMLInputElement>, data: any) => {
    const value = data.checked
    console.log(data)
    console.log(event)

    const updatedSettings: AoiSettings = {
      atmosphericCorrection: value,
    }

    this.props.updateSettings(updatedSettings)
  }

  toggleTileSettings = () => {
    console.log('Showing tile options')
    this.setState({
      optionsHide: !this.state.optionsHide,
    })
  }

  handleTileSettingsClose = (event: any) => {
    console.log('Tile settings closing')

    if (event.type === 'click') {
      this.setState({
        optionsHide: true,
      })
    }
  }

  toggle = () => {
    this.setState({
      optionsHide: !this.state.optionsHide,
    })
  }

  progressBar = (taskStatus: JobInfoObject) => {
    if (taskStatus && taskStatus.status === TaskStatus.Started) {
      let taskProgress = taskStatus.progress

      if (taskProgress.hasOwnProperty('upload')) {
        return <Progress percent={50 + Math.round(taskProgress['upload'] / 2)} color="green" attached="bottom" active />
      } else if (taskProgress.hasOwnProperty('download')) {
        return <Progress percent={Math.round(taskProgress['download'] / 2)} color="green" attached="bottom" active />
      }
    }
  }
  

  render() {
    let dateSectionHeaderClassname = 'dateSection'

    let optionsHeaderClass = 'optionsWrapper'
    optionsHeaderClass += this.state.optionsHide ? ' removed' : ' flexed'
    let currentPlatform = ''
    let platformAbbreviation = ''

    if (this.props.currentPlatform) {
      if (this.props.currentPlatform === 'sentinel2') {
        currentPlatform = 'Sentinel 2'
        platformAbbreviation = 'S2'
      } else if (this.props.currentPlatform === 'landsat8') {
        currentPlatform = 'Landsat 8'
        platformAbbreviation = 'L8'
      }
    }

    return (
      <div className="tileList">
        <div className="header">
          <Header size="small">Tiles {currentPlatform !== '' ? '- ' + currentPlatform : ''}</Header>
          <div className="buttonSection">
            <Button compact onClick={() => this.props.switchToSen2AgriPanel()}>
              Sen2Agri
            </Button>
            <Popup
              trigger={
                <Button
                  icon
                  compact
                  onClick={e =>
                    this.props.currentAoi !== '' ? this.toggle() : console.log('No Aoi Selected, not showing options')
                  }
                >
                  <Icon name="cog" />
                </Button>
              }
              flowing
              onClose={e => this.handleTileSettingsClose(e)}
              open={!this.state.optionsHide}
              position="bottom right"
              positionFixed={false}
              offset={'4px'}
              className="optionsPopup"
            >
              <Grid divided columns={1}>
                <Grid.Column>
                  <Header as="h4">Tile Processing Options</Header>
                  <ul>
                    <li key={'atmosphericCorrection'}>
                      <Checkbox
                        label="Atmospheric Correction (Sen2Cor/LaSRC)"
                        onChange={this.updateAtmosphericCorrection}
                        checked={
                          this.props.currentSession ? this.props.currentSession.settings.atmosphericCorrection : false
                        }
                      />
                    </li>
                    <li key={'saveAsJson'}>
                      <Button onClick={e => this.props.saveTileJson()}>Save Tile List as JSON</Button>
                    </li>
                    <li key={'copyToClipboard'}>
                      <Button onClick={e => this.props.copyCurrentTilesToClipboard()}>
                        {this.props.selectedTilesInList.length === 0
                          ? `Copy ${platformAbbreviation} Names to Clipboard`
                          : `Copy Highlighted ${platformAbbreviation} Names to Clipboard`}
                      </Button>
                    </li>
                  </ul>
                </Grid.Column>
              </Grid>
            </Popup>
            <Button color="green" compact onClick={() => this.props.submitAllJobs()}>
              {this.props.selectedTilesInList.length === 0 ? 'Start All' : 'Start Highlighted'}
            </Button>
          </div>
        </div>
        <div className={optionsHeaderClass}></div>
        <div className="listOfTiles">
          <div className="listWrapper">
            {Object.keys(this.props.selectedTiles).map((d: string) => {
              let listElements = []

              if (this.props.selectedTiles[d].length > 0) {
                const headerEle = (
                  <Header
                    as="h5"
                    className={dateSectionHeaderClassname}
                    onClick={() => this.props.dateClicked(moment(d).format('YYYYMMDD'))}
                    key={d}
                  >
                    {moment(d).format('MMMM DD YYYY')}
                  </Header>
                )
                listElements.push(headerEle)
                let counter = 0

                const segmentGroup =(
                  <Segment.Group key={"segmentGroup" + d}>
                    {this.props.selectedTiles[d].map((tile, idx) => {
                      let clsName = 'tileListItem'

                      if (this.props.selectedTilesInList.includes(tile.id)) {
                        clsName = 'tileListItem activeSelection'
                      }
    
                      if (counter % 2 === 0) {
                        clsName += ' altBackground'
                      }
    
                      counter++
    
                      // Get the most recent L8BatchDownload or S2BatchDownload job for the AoI
                      let taskStatus: JobInfoObject = undefined

                      if (['sentinel2', 'landsat8'].includes(this.props.currentPlatform)) {
                        if (this.props.jobs.byAoiId[this.props.currentAoi] && this.props.jobs.byAoiId[this.props.currentAoi].length > 0) {
                          const jobIds = this.props.jobs.byAoiId[this.props.currentAoi]
    
                          let mostRecentJobIdForTile = undefined
    
                          const tileJobs = [...tile.jobs]
                          console.log("tile jobs: ")
                          console.log(tileJobs)
    
                          if (tileJobs.length > 0) {
                            
                            while (tileJobs.length !== 0) {
                              mostRecentJobIdForTile = tileJobs[tileJobs.length -1]
                              console.log(mostRecentJobIdForTile)
    
                              if (!!!jobIds.includes(mostRecentJobIdForTile)) {
                                tileJobs.pop()
                              } else {
                                break
                              }
                            }
                          }
                          
                          if (mostRecentJobIdForTile) {
                            const mostRecentJob = this.props.jobs.byId[mostRecentJobIdForTile]
                            console.log(mostRecentJob)
                            if (mostRecentJob && mostRecentJob.type === "L8BatchDownload" && mostRecentJob.params.ac) {
                              if (mostRecentJob && mostRecentJob.hasOwnProperty('progressInfo')) {
                                taskStatus = {
                                  result: "",
                                  status: TaskStatus.Pending,
                                  name: "",
                                  kwargs: "",
                                  args: ""                        
                                }
                                const taskId = mostRecentJob.progressInfo.tile_ids[tile.id]
                                let taskStatusOverall = mostRecentJob.progressInfo.task_progress[taskId].progress
                                taskStatus["progress"] = taskStatusOverall[tile.properties.name]
                                taskStatus["status"] = taskStatus["progress"].status
                                // console.warn(tile.properties)
                                // console.warn(taskId)
                                // console.warn(taskStatusOverall)
                                // console.warn(taskStatus)
                              } else if (mostRecentJob && !mostRecentJob.hasOwnProperty('progressInfo')) {
                                const tempTaskStatus: JobInfoObject = {
                                  name: null,
                                  kwargs: null,
                                  args: null,
                                  status: TaskStatus.Pending,
                                }
                                taskStatus = tempTaskStatus
                              }
                            } else {
                              if (mostRecentJob && mostRecentJob.hasOwnProperty('progressInfo')) {
                                const taskId = mostRecentJob.progressInfo.tile_ids[tile.id]
                                taskStatus = mostRecentJob.progressInfo.task_progress[taskId]
                              } else if (mostRecentJob && !mostRecentJob.hasOwnProperty('progressInfo')) {
                                const tempTaskStatus: JobInfoObject = {
                                  name: null,
                                  kwargs: null,
                                  args: null,
                                  status: TaskStatus.Pending,
                                }
                                taskStatus = tempTaskStatus
                              }
                            }
                          }
                        }
                      }
                      
                      return (
                         <div key={d+ idx}
                         >
                          <TileListItemCompact
                            cssClass={clsName}
                            handleTileClicked={this.props.tileClicked}
                            tile={tile}
                            taskStatus={taskStatus}
                            removeTile={this.props.removeTile}
                            toggleVisibility={this.props.toggleTileVisibility}
                            resubmitLastJob={this.props.resubmitLastJob}
                          />
                          
                          {this.props.selectedTiles[d].length - 1 !== idx ? <Divider key={d}/> : null }
                        </div>)
                    })
                  }
                  </Segment.Group>
                )

                listElements.push(segmentGroup)
                return listElements
              }
            })}
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state: AppState) => ({
  jobs: state.job,
  currentSession: state.session.currentAoi ? state.aoi.byId[state.session.currentAoi].session : null,
})

export default connect(
  mapStateToProps,
  {},
)(TileList)
