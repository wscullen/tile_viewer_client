import '../assets/css/MainContainer.scss'
import '../assets/css/CenterContainer.scss'

import '../assets/css/App.scss'

import React, { Component, ReactElement } from 'react'
import { connect } from 'react-redux'
import moment from 'moment'

import { Header } from 'semantic-ui-react'

import { AppState } from '../store/'

import { TileState, Tile, TileListByDate } from '../store/tile/types'
import { addTile, updateTile } from '../store/tile/actions'

import {
  AreaOfInterestState,
  AreaOfInterest,
  TileList as TileListInterface,
  Session,
  CurrentDates,
  DateObject,
} from '../store/aoi/types'

import { MainSessionState } from '../store/session/types'
import { updateMainSession, resetState as resetSessionState, updateAddAoiForm } from '../store/session/actions'

import { addAoi, removeAoi, updateSession } from '../store/aoi/actions'

import { SingleDateTileList } from '../store/aoi/types'

import { JobState, Job, JobStatus } from '../store/job/types'
import { addJob, removeJob, updateJob } from '../store/job/actions'

import { thunkAddJob, thunkAddJobs, thunkCheckJobsForAoi } from '../store/job/thunks'
import { thunkUpdateCsrfTokens } from '../store/session/thunks'

import { thunkSendMessage } from '../thunks'

import MapViewer from './MapViewer'

import AreaOfInterestList from './AreaOfInterestList'
import TimelineViewer from './TimelineViewer'

import TileList from './TileList'

import AddAreaOfInterestModal from './AddAreaOfInterestModal'

import FilteringTools from './FilteringTools'

import JobViewer from './JobViewer'
import AreaOfInterestDetailView from './AreaOfInterestDetailView'

// @ts-ignore
import base64 from 'base-64'
import { ipcRenderer } from 'electron'
import { History } from 'history'

const fs = require('fs') // or directly

// To use it, simply call
const { clipboard } = require('electron')

const remote = require('electron').remote
const path = require('path')

const resourcesPath = path.join(remote.app.getPath('userData'), 'localstorage.json')

console.log('Resource path for saving local data')
console.log(resourcesPath)

import { getAoiNames, getSelectedTiles, getHighlightedTiles } from '../store/aoi/reducers'

interface AppProps {
  addTile: typeof addTile
  updateTile: typeof updateTile
  addAoi: typeof addAoi
  removeAoi: typeof removeAoi
  updateSession: typeof updateSession
  updateMainSession: typeof updateMainSession
  resetSessionState: typeof resetSessionState
  updateAddAoiForm: typeof updateAddAoiForm
  aois: AreaOfInterestState
  session: MainSessionState
  jobs: JobState
  tiles: TileState
  thunkAddJob: any
  thunkUpdateCsrfTokens: any
  history: History
  aoiNames: string[]
  selectedTiles: TileListByDate
  highlightedTiles: string[]
  thunkCheckJobsForAoi: Function
  thunkAddJobs: Function
}

interface SelectorFunctions {
  aoiNames: string[]
}

export interface JobObject {
  job_status: string
  job_id: string
  job_result: string
  job_assigned: string
  job_completed: string
  job_submitted: string
  job_result_message: string
  times_checked: number
}

interface JobStatusVerbose {
  [key: string]: string
  C: string
  A: string
  S: string
}

interface DefaultAppState {
  show: boolean
  aoi_list: Record<string, any>[]
  activeAOI: string
  allTiles: Record<string, any>
  selectedTiles: {
    [key: string]: Record<string, any>
  }
  selectedTilesInList: string[]
  job_csrf_token: string
  currentDate: string
  tileDict: Record<string, any>
  cloudPercentFilter: number
  jobSettings: {
    atmosphericCorrection: boolean
  }
  enableSen2AgriL2A: boolean
  enableSen2AgriL3A: boolean
  enableSen2AgriL3B: boolean
  sen2agri_l2a_job: JobObject
  sen2agri_l3a_job: JobObject
  sen2agri_l3b_job: JobObject
  initMap: boolean
  jobCheckIntervalId: number
}

const defaultState: DefaultAppState = {
  show: false,
  aoi_list: [],
  activeAOI: null,
  allTiles: {},
  selectedTiles: {},
  selectedTilesInList: [],
  job_csrf_token: null,
  currentDate: null,
  tileDict: {},
  cloudPercentFilter: 100,
  jobSettings: {
    atmosphericCorrection: false,
  },
  enableSen2AgriL2A: false,
  enableSen2AgriL3A: false,
  enableSen2AgriL3B: false,
  sen2agri_l2a_job: null,
  sen2agri_l3a_job: null,
  sen2agri_l3b_job: null,
  initMap: false,
  jobCheckIntervalId: -1,
}

const JOB_CHECK_FREQUENCY = 30000

class MainContainer extends Component<AppProps, AppState & DefaultAppState & SelectorFunctions> {
  constructor(props: AppProps) {
    super(props)

    // clear react simple storage (for debuggin and testing purposes)

    ipcRenderer.on('menu-item', (event: any, arg: any) => {
      console.log(event)
      console.log(arg)

      if (arg.menuItem.label === 'Clear Local Storage') {
        localStorage.clear()
        // store.clear()
        console.log('clearing local storage')
        this.resetState()
      }

      if (arg.menuItem.label === 'Settings') {
        console.log('trying to go to settings')
        const { history } = this.props
        history.push('/settings')
      }

      if (arg.menuItem.id === 'session-settings') {
        this.props.resetSessionState()
      }
    })

    this.state = {
      ...defaultState,
      ...this.state,
    }

    console.log(`default state is ${this.state}`)
    console.log(this.state)
  }

  componentDidMount() {
    // Required for events outside the react lifecycle like refresh and quit
    window.addEventListener('beforeunload', this.cleanUpBeforeClose)
    window.addEventListener('keydown', this.handleKeyPress)
    console.log('=================> Inside component did mount')
    if (this.props.session.currentAoi) {
      console.log('activating AOI...')
      this.activateAoi(this.props.aois.byId[this.props.session.currentAoi].name)
    }
  }

  componentWillUnmount() {
    console.log('=================> Inside component will unmount')

    console.log(this.state)

    const newAoiFormState = {
      ...this.props.session.forms.addAoi,
      msg: '',
      success: false,
      finished: false,
      submitting: false,
    }

    console.log(newAoiFormState)

    this.props.updateAddAoiForm(newAoiFormState)

    window.removeEventListener('beforeunload', this.cleanUpBeforeClose)
  }

  public removeAoi = (aoiName: string): void => {
    console.log(aoiName)
    console.log('removing aoi...')

    if (this.props.session.currentAoi && this.props.aois.byId[this.props.session.currentAoi].name === aoiName) {
      const session = { ...this.props.session }
      session.currentAoi = ''

      this.props.updateMainSession(session)
    }

    this.props.removeAoi(aoiName)
  }

  cleanUpBeforeClose = () => {}

  saveToLocalStorage = () => {}

  loadFromLocalStorage = () => {}

  public handleTabChange = (event: React.MouseEvent<HTMLUListElement>): void => {
    const target = event.currentTarget as HTMLUListElement
    console.log(target.id)
    console.log(target)
    console.log(event.currentTarget)
    console.log('======================+')
    console.log('trying to update active tab')
    const session = { ...this.props.session }
    const prevTab = session.activeTab
    session.activeTab = parseInt(target.id)
    this.props.updateMainSession(session)

    if (session.activeTab === 0 && prevTab !== 0) {
      setTimeout(() => {
        console.log('Activating after tab switch')

        let initMap
        if (session.currentAoi !== '') {
          this.activateAoi(this.props.aois.byId[session.currentAoi].name)
        }
      }, 1000)
    }
  }

  public handleJobTabChange = (event: React.MouseEvent<HTMLUListElement>): void => {
    const target = event.currentTarget as HTMLUListElement
    console.log(target.id)
    console.log(target)
    console.log(event.currentTarget)
    console.log('======================+')
    console.log('trying to update active Job tab')
    const session = { ...this.props.session }
    const prevTab = session.activeJobTab
    if (prevTab !== parseInt(target.id)) {
      session.activeJobTab = parseInt(target.id)
      this.props.updateMainSession(session)
    }
  }

  resetState = () => {
    console.log('resetting state')
  }

  showModal = () => {
    this.setState({ show: true })
  }

  hideModal = () => {
    const newAoiFormState = {
      ...this.props.session.forms.addAoi,
      msg: '',
      success: false,
      finished: false,
      submitting: false,
    }

    console.log(newAoiFormState)

    this.props.updateAddAoiForm(newAoiFormState)
    this.setState({ show: false })
  }

  clearLocalStorage = () => {
    localStorage.clear()
  }

  handleKeyPress = (event: KeyboardEvent) => {
    console.log('key pressed')
    console.log(event.key)

    if (this.state.activeAOI !== '' && this.props.session.activeTab === 0 && !this.state.show) {
      switch (event.key) {
        case 'ArrowRight': {
          console.log('Right arrow pressed, incrementing date')
          this.incrementDate()
          break
        }
        case 'ArrowLeft': {
          console.log('Left arrow pressed, decrementing date')
          this.decrementDate()
          break
        }
        case 'a': {
          console.log('Spacebar pressed, selecting all visible for current date')
          this.selectAllVisibleTiles()
          break
        }
      }
    }
  }

  public incrementDate = (initDate?: string): void => {
    console.log('increment date button pressed')
    // @ts-ignore
    if (!this.props.session.currentAoi) {
      return
    }

    const currentAoi: AreaOfInterest = this.props.aois.byId[this.props.session.currentAoi]
    const session = { ...currentAoi.session }
    const currentPlatform = session.currentPlatform
    const dateList = session.datesList[currentPlatform].dates
    let currentDate = ''

    if (initDate) {
      currentDate = initDate
    } else {
      currentDate = session.datesList[currentPlatform].currentDate
    }

    const indexOfCurrentDate = dateList.indexOf(currentDate)

    if (indexOfCurrentDate !== dateList.length - 1) {
      const newIndex = indexOfCurrentDate + 1
      const newDate = dateList[newIndex]
      session.datesList[currentPlatform].currentDate = newDate
      this.handleUpdateCloudFilter(session.cloudPercentFilter.toString())

      let allNotVisible = true
      for (const id of currentAoi.allTiles[currentPlatform][newDate]) {
        if (this.props.tiles.byId[id].visible) {
          allNotVisible = false
          break
        }
      }

      if (allNotVisible) {
        console.log('recuring into incrementDate')
        this.incrementDate(newDate)
      } else {
        console.log('updating session and cloud filter')
        this.props.updateSession(currentAoi.id, session)
      }
    }
  }

  public decrementDate = (initDate?: string): void => {
    console.log('decrement date button pressed')
    // @ts-ignore
    if (!this.props.session.currentAoi) {
      return
    }

    const currentAoi: AreaOfInterest = this.props.aois.byId[this.props.session.currentAoi]
    const session = { ...currentAoi.session }
    const currentPlatform = session.currentPlatform
    const dateList = session.datesList[currentPlatform].dates
    let currentDate = ''

    if (initDate) {
      currentDate = initDate
    } else {
      currentDate = session.datesList[currentPlatform].currentDate
    }

    const indexOfCurrentDate = dateList.indexOf(currentDate)

    if (indexOfCurrentDate !== 0) {
      const newIndex = indexOfCurrentDate - 1
      const newDate = dateList[newIndex]
      session.datesList[currentPlatform].currentDate = newDate
      this.handleUpdateCloudFilter(session.cloudPercentFilter.toString())

      let allNotVisible = true
      for (const id of currentAoi.allTiles[currentPlatform][newDate]) {
        if (this.props.tiles.byId[id].visible) {
          allNotVisible = false
          break
        }
      }

      if (allNotVisible) {
        console.log('recuring into decrement')
        this.decrementDate(newDate)
      } else {
        console.log('updating session and cloud filter')
        this.props.updateSession(currentAoi.id, session)
      }
    }
  }

  public setDate = (initDate: string): void => {
    const currentAoi: AreaOfInterest = this.props.aois.byId[this.props.session.currentAoi]
    const currentPlatform = currentAoi.session.currentPlatform
    const dateList = currentAoi.session.datesList[currentPlatform].dates
    const session = { ...currentAoi.session }

    if (dateList.includes(initDate)) {
      session.datesList[currentPlatform].currentDate = initDate
      this.props.updateSession(this.props.session.currentAoi, session)
    }
  }

  toggleVisibility = (tileId: any) => {
    const relevantTile: Tile = { ...this.props.tiles.byId[tileId] }
    relevantTile.visible = !relevantTile.visible
    this.props.updateTile(relevantTile)
  }

  activateAoi = (aoi_name: string) => {
    // When an AOI is clicked in the list, it is made active and passed to the map viewer
    console.log('YOU CLICKED AN AREA OF INTEREST')
    console.log(aoi_name)
    let prevAoiName: string = ''
    if (this.props.session.currentAoi) {
      prevAoiName = this.props.aois.byId[this.props.session.currentAoi].name
      console.log('Resuming job status checking for this aoi...')
      if (this.state.jobCheckIntervalId !== -1) window.clearInterval(this.state.jobCheckIntervalId)
      let jobCheckIntervalId = window.setInterval(() => {
        console.log('Checking job statuses for current AOI')
        this.props.thunkCheckJobsForAoi(this.props.session.currentAoi)
      }, JOB_CHECK_FREQUENCY)

      this.setState({
        jobCheckIntervalId,
      })
    }

    if (prevAoiName === aoi_name) return

    const areasOfInterest = { ...this.props.aois.byId }
    console.log(areasOfInterest)
    let areaOfInterest: AreaOfInterest

    Object.keys(areasOfInterest).map((id: string) => {
      console.log(aoi_name)
      console.log(areasOfInterest[id].name)
      if (areasOfInterest[id].name === aoi_name) {
        areaOfInterest = areasOfInterest[id]
      }
    })

    console.log('___aoi: ')
    console.log(areaOfInterest)

    const currentMainSession = { ...this.props.session }
    currentMainSession.currentAoi = areaOfInterest.id

    this.props.updateMainSession(currentMainSession)
  }

  public selectAllVisibleTiles = (): void => {
    if (!this.props.session.currentAoi) {
      return
    }

    const currentAoi: AreaOfInterest = this.props.aois.byId[this.props.session.currentAoi]
    const currentPlatform: string = currentAoi.session.currentPlatform
    const currentDate: string = currentAoi.session.datesList[currentPlatform].currentDate

    currentAoi.allTiles[currentPlatform][currentDate].map((id: string): void => {
      const tile: Tile = { ...this.props.tiles.byId[id] }
      const tileSelected = tile.selected
      if (tile.visible) {
        tile.selected = true
      } else {
        tile.selected = false
      }
      if (tileSelected !== tile.selected) {
        this.props.updateTile(tile)
      }
    })
  }

  public handleSubmitAllJobs = (): void => {
    console.log('submitting all jobs for selected tiles')

    const tiles = this.props.selectedTiles
    const highlightedTiles = this.props.highlightedTiles

    const newJobs: Job[] = []

    Object.keys(tiles).map(ele => {
      console.log(ele)
      console.log(tiles[ele])

      if (tiles[ele].length > 0) {
        tiles[ele].map((tile: Tile) => {
          console.log(tile)

          if (highlightedTiles.length > 0) {
            if (tile.highlighted) {
              const newJob: Job = {
                aoiId: this.props.session.currentAoi,
                assignedDate: '',
                checkedCount: 0,
                completedDate: '',
                id: '',
                setIntervalId: 0,
                status: JobStatus.Submitted,
                submittedDate: '',
                success: false,
                type: 'tile',
                workerId: '',
                tileId: tile.id,
                resultMessage: '',
              }
              // console.log('Submitting job')
              // this.props.thunkAddJob(newJob)
              newJobs.push(newJob)
            }
          } else {
            const newJob: Job = {
              aoiId: this.props.session.currentAoi,
              assignedDate: '',
              checkedCount: 0,
              completedDate: '',
              id: '',
              setIntervalId: 0,
              status: JobStatus.Submitted,
              submittedDate: '',
              success: false,
              type: 'tile',
              workerId: '',
              tileId: tile.id,
              resultMessage: '',
            }
            // console.log('Submitting job')
            // this.props.thunkAddJob(newJob)
            newJobs.push(newJob)
          }
        })
      }
    })
    console.log('Submitting all jobs at once...')
    this.props.thunkAddJobs(newJobs, this.props.session.currentAoi)
  }

  getAoiIndex = (aoi_name: string): number => {
    // returning index instead of the object itself
    // @ts-ignore
    console.log(this.state.aoi_list)
    // @ts-ignore
    const name_list = this.state.aoi_list.map((ele: any) => ele.name)
    const index = name_list.indexOf(aoi_name)
    return index
  }

  public handleTileSelect = (tiles: string[]): void => {
    console.log('Tile was selected')
    console.log(tiles)
    const existingTiles = { ...this.props.tiles.byId }
    console.log(existingTiles)

    for (const [key, tile] of Object.entries(existingTiles)) {
      for (const t of tiles) {
        if (key === t && tile.visible) {
          tile.selected = !tile.selected
          if (!tile.selected) {
            tile.highlighted = false
          }
          this.props.updateTile(tile)
        }
      }
    }
  }

  handleTileClickedInList = (event: React.MouseEvent<HTMLElement>, tileId: string) => {
    // if a tile is clicked in the list
    // currentDate should be changed to this tiles date
    // cyan blue highlight overlay should be added to indicate the most recently clicked tiles

    const relevantTile = { ...this.props.tiles.byId[tileId] }
    const tileDate = moment(relevantTile.date).format('YYYYMMDD')
    console.log('tile clicked in list')
    console.log(tileId)
    console.log(event.shiftKey)
    console.log(event.ctrlKey)

    let currentAoi: AreaOfInterest = this.props.aois.byId[this.props.session.currentAoi]

    const currentPlatform = currentAoi.session.currentPlatform
    let currentDate = currentAoi.session.datesList[currentPlatform].currentDate

    if (event.ctrlKey) {
      // If ctrl key is pressed, we simply toggle the relevant tile
      relevantTile.highlighted = !relevantTile.highlighted
      this.props.updateTile(relevantTile)
    } else {
      // if ctrl key is not pressed, we have to iterate over each tile, de-highlight, and finally highlight the relevant tile.
      for (const [key, value] of Object.entries(currentAoi.allTiles[currentPlatform])) {
        value.map((id: string) => {
          console.log('changing the highlight value for')
          const tile = { ...this.props.tiles.byId[id] }
          if (relevantTile.id === tile.id) {
            tile.highlighted = !tile.highlighted
          } else {
            tile.highlighted = false
          }
          this.props.updateTile(tile)
        })
      }
    }

    if (currentDate !== tileDate) {
      console.log('currentDate and tileDate is different')
      currentDate = tileDate
      const session = { ...currentAoi.session }
      session.datesList[currentPlatform].currentDate = currentDate
      this.props.updateSession(currentAoi.id, session)
    }
  }

  removeTileFromSelected = (tileId: string) => {
    console.log('Tile removed:')
    console.log(tileId)
    const relevantTile: Tile = { ...this.props.tiles.byId[tileId] }
    relevantTile.selected = !relevantTile.selected
    relevantTile.highlighted = false
    this.props.updateTile(relevantTile)
  }

  handleUpdateCloudFilter = (cloud: string) => {
    if (this.props.session.currentAoi === '') {
      return
    }

    // TODO Make a selector function and assign to props
    let currentAoi = this.props.aois.byId[this.props.session.currentAoi]

    const newSession = { ...currentAoi.session }

    newSession.cloudPercentFilter = parseFloat(cloud)
    this.props.updateSession(currentAoi.id, newSession)

    const currentPlatform = currentAoi.session.currentPlatform
    const currentDate = currentAoi.session.datesList[currentPlatform].currentDate

    currentAoi.allTiles[currentPlatform][currentDate].map(id => {
      const tile: Tile = { ...this.props.tiles.byId[id] }
      const tileVisible = tile.visible
      if (tile.properties.cloudPercent > parseFloat(cloud)) {
        tile.visible = false
      } else {
        tile.visible = true
      }
      if (tileVisible !== tile.visible) {
        this.props.updateTile(tile)
      }
    })
  }

  public deselectAllForCurrentDate = (): void => {
    if (!this.props.session.currentAoi) {
      return
    }

    const currentAoi: AreaOfInterest = this.props.aois.byId[this.props.session.currentAoi]
    const currentPlatform: string = currentAoi.session.currentPlatform
    const currentDate: string = currentAoi.session.datesList[currentPlatform].currentDate

    currentAoi.allTiles[currentPlatform][currentDate].map((id: string): void => {
      const tile: Tile = { ...this.props.tiles.byId[id] }
      const tileSelected = tile.selected
      tile.selected = false

      if (tileSelected !== tile.selected) {
        this.props.updateTile(tile)
      }
    })
  }

  updateJobSettings = (newSettings: any) => {
    console.log(newSettings)
    const testObject = {
      ...this.state.jobSettings,
      ...newSettings,
    }

    console.log('new job settings')
    console.log(testObject)

    if (this.props.session.currentAoi !== '') {
      const currentAoiSession = { ...this.props.aois.byId[this.props.session.currentAoi].session }
      currentAoiSession.settings = newSettings

      this.props.updateSession(this.props.session.currentAoi, currentAoiSession)
    }
  }

  public getTileList = (
    removeEmptyDates: boolean = false,
    onlyHighlightedTiles: boolean = false,
  ): TileListInterface => {
    const tileList: TileListInterface = {}
    const currentAoi: AreaOfInterest = this.props.aois.byId[this.props.session.currentAoi]

    if (currentAoi) {
      for (let platform of currentAoi.sensorList) {
        const selectedTiles: DateObject = {}

        for (const [key, value] of Object.entries(currentAoi.allTiles[platform])) {
          const tileArray: string[] = []
          value.map((id: string): void => {
            if (onlyHighlightedTiles) {
              if (this.props.tiles.byId[id].selected && this.props.tiles.byId[id].highlighted) {
                tileArray.push(this.props.tiles.byId[id].properties.name)
              }
            } else {
              if (this.props.tiles.byId[id].selected) {
                tileArray.push(this.props.tiles.byId[id].properties.name)
              }
            }
          })
          if (removeEmptyDates) {
            if (tileArray.length !== 0) {
              selectedTiles[key] = tileArray
            }
          } else {
            selectedTiles[key] = tileArray
          }
        }
        tileList[platform] = selectedTiles
      }
    }

    return tileList
  }

  public saveTileJson = (): void => {
    console.log('trying to save to json')

    const { dialog } = require('electron').remote
    console.log(dialog)

    dialog.showSaveDialog({ defaultPath: 'tilelist.json' }, (filename: string): void => {
      if (filename) {
        const tileList = this.getTileList(true)
        console.log(filename)
        console.log(tileList)

        fs.writeFileSync(filename, JSON.stringify(tileList))
        console.log('stringified AOI list successfully')
      }
    })
  }

  public copyCurrentTilesToClipboard = (): void => {
    console.log('copying space separated list of tiles to clipboard')
    const currentAoi: AreaOfInterest = this.props.aois.byId[this.props.session.currentAoi]

    if (currentAoi) {
      const tileClipboardList: string[] = []

      const currentPlatform = currentAoi.session.currentPlatform

      const tilesHighlighted = this.props.highlightedTiles.length !== 0
      let tileList
      if (tilesHighlighted) {
        tileList = this.getTileList(true, true)
      } else {
        tileList = this.getTileList(true)
      }

      for (const [key, value] of Object.entries(tileList[currentPlatform])) {
        value.map((name: string): void => {
          tileClipboardList.push(name)
        })
      }

      const clipboardString = tileClipboardList.join(' ')
      clipboard.writeText(clipboardString)
    }
  }

  public handlePlatformChange = (event: React.SyntheticEvent<HTMLOptionElement>, value: string): void => {
    let aoiSession = { ...this.props.aois.byId[this.props.session.currentAoi].session }
    aoiSession.currentPlatform = value

    this.props.updateSession(this.props.session.currentAoi, aoiSession)
  }

  public resubmitLastJob = (tile: Tile): void => {
    console.log('Trying to submit most recent job for this tile again.')

    // steps, from the tile, get the last entry in the jobId list
    // look up job info, recreate job,
    // submit again.

    console.log(tile)
    const jobId = tile.jobs[tile.jobs.length - 1]
    const job = this.props.jobs.byId[jobId]

    job.assignedDate = ''
    job.completedDate = ''
    job.submittedDate = ''
    job.success = false
    job.workerId = ''
    job.resultMessage = ''

    this.props.thunkAddJob(job)
  }

  switchToSen2AgriPanel = () => {
    // set active tab to Jobs
    // and Jobs tab to Sen2Agri
    const session = { ...this.props.session }
    if (session.activeTab !== 1) {
      session.activeTab = 1
      session.activeJobTab = 1
      this.props.updateMainSession(session)
    }
  }

  sortTilesByDate = (tiles: any) => {
    if (tiles) {
      const formatted_tiles = []
      console.log('sorting tile by date')

      for (const raw_tile of tiles) {
        console.log(raw_tile)

        const proj = raw_tile.epsg_code
        const start_date = moment(raw_tile.acquisition_start)
        const end_date = moment(raw_tile.acquisition_end)
        const mid_date_ts = (start_date.valueOf() + end_date.valueOf()) / 2
        const mid_date = moment(mid_date_ts)
        const tile = {
          name: raw_tile.name,
          wkt: raw_tile.footprint,
          lowres_preview_url: raw_tile.preview_url,
          proj,
          date: mid_date,
          cloud: raw_tile['cloud_percent'],
          visible: true,
          geojson: raw_tile['geojson'],
        }
        formatted_tiles.push(tile)
      }

      const groups = formatted_tiles.reduce((groups, tile) => {
        const date = tile.date.format('YYYYMMDD')

        //@ts-ignore
        if (!groups[date]) {
          //@ts-ignore
          groups[date] = []
        }

        //@ts-ignore
        groups[date].push(tile)
        return groups
      }, {})

      const groupArrays = Object.keys(groups).map(date => {
        return {
          date,
          //@ts-ignore
          tiles: groups[date],
        }
      })

      console.log(groupArrays)
      console.log(groups)

      return { datesArray: groupArrays, datesObject: groups }
    }
    return { datesArray: [], datesObject: {} }
  }

  public mainTabSwitcher = (
    currentAoi: AreaOfInterest,
    currentTiles: Tile[],
    selectedTiles: SingleDateTileList,
    highlightedTiles: string[],
    currentPlatform: string,
    currentDate: string,
  ): ReactElement => {
    let allPlatforms: string[] = []

    console.log(this.props)
    if (currentAoi) {
      allPlatforms = Object.keys(this.props.aois.byId[this.props.session.currentAoi].session.datesList)
    }

    console.log(currentPlatform)

    if (this.props.session.activeTab === 0) {
      return (
        <div className="contentContainer">
          <div className="mapContainer">
            <MapViewer
              tiles={currentTiles}
              tilesSelectedInList={highlightedTiles}
              tileSelected={this.handleTileSelect}
              currentAoiWkt={currentAoi ? currentAoi.wktFootprint : null}
              wrsOverlay={currentAoi ? currentAoi.wrsOverlay : null}
              activeAoi={currentAoi ? currentAoi.name : null}
              currentDate={currentAoi ? currentAoi.session.datesList[currentPlatform].currentDate : null}
              currentPlatform={currentPlatform}
              initializeMap={this.state.initMap}
            />
            <FilteringTools
              selectAll={this.selectAllVisibleTiles}
              deselectAll={this.deselectAllForCurrentDate}
              updateCloudFilter={this.handleUpdateCloudFilter}
              cloudPercentFilter={currentAoi ? currentAoi.session.cloudPercentFilter : 100}
            />
            <TimelineViewer
              currentDate={currentDate}
              dateList={currentAoi ? currentAoi.session.datesList[currentPlatform].dates : []}
              incrementDate={this.incrementDate}
              decrementDate={this.decrementDate}
              allPlatforms={allPlatforms}
              currentPlatform={currentPlatform}
              handlePlatformChange={this.handlePlatformChange}
            />
          </div>
          <TileList
            settings={currentAoi ? currentAoi.session.settings : { atmosphericCorrection: false }}
            currentAoi={this.props.session.currentAoi}
            switchToSen2AgriPanel={this.switchToSen2AgriPanel}
            updateSettings={this.updateJobSettings}
            selectedTiles={selectedTiles}
            selectedTilesInList={highlightedTiles}
            tileClicked={this.handleTileClickedInList}
            dateClicked={this.setDate}
            removeTile={this.removeTileFromSelected}
            submitAllJobs={this.handleSubmitAllJobs}
            saveTileJson={this.saveTileJson}
            copyCurrentTilesToClipboard={this.copyCurrentTilesToClipboard}
            currentPlatform={currentPlatform}
            toggleTileVisibility={this.toggleVisibility}
            resubmitLastJob={this.resubmitLastJob}
          />
        </div>
      )
    } else if (this.props.session.activeTab === 1) {
      return (
        <div className="jobViewer">
          <Header size="large">Jobs</Header>
          <JobViewer activeTab={this.props.session.activeJobTab} handleTabChange={this.handleJobTabChange} />
        </div>
      )
    } else if (this.props.session.activeTab === 2) {
      return (
        <div>
          <Header size="large">Details</Header>
          <AreaOfInterestDetailView />
        </div>
      )
    }
  }

  render() {
    const aois = Object.values(this.props.aois.byId)
    let currentAoi: AreaOfInterest

    if (this.props.session.currentAoi !== '') currentAoi = this.props.aois.byId[this.props.session.currentAoi]

    let selectedTiles: SingleDateTileList = {}
    let highlightedTiles: string[] = []
    let currentTiles: Tile[] = []
    let currentPlatform = ''
    let currentDate = ''

    if (currentAoi) {
      const session = { ...currentAoi.session }
      currentPlatform = session.currentPlatform
      currentDate = currentAoi.session.datesList[currentPlatform].currentDate

      currentTiles = currentAoi.allTiles[currentPlatform][currentDate].map(id => {
        return this.props.tiles.byId[id]
      })

      console.log(currentTiles)

      selectedTiles = this.props.selectedTiles
      highlightedTiles = this.props.highlightedTiles
    }

    return (
      <div className="mainContainer" ref="mainContainer">
        <AddAreaOfInterestModal
          show={this.state.show}
          hideModal={this.hideModal}
          settings={this.props.session.settings}
          aoiNames={this.props.aoiNames}
        />
        <AreaOfInterestList
          addAreaModal={this.showModal}
          areasOfInterest={aois}
          activateAoi={this.activateAoi}
          activeAoi={currentAoi ? currentAoi.name : null}
          removeAoi={this.removeAoi}
          activeTab={this.props.session.activeTab}
          handleTabChange={this.handleTabChange}
        />
        <div className="rightContainer">
          {this.mainTabSwitcher(
            currentAoi,
            currentTiles,
            selectedTiles,
            highlightedTiles,
            currentPlatform,
            currentDate,
          )}
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state: AppState) => ({
  tiles: state.tile,
  aois: state.aoi,
  session: state.session,
  jobs: state.job,
  aoiNames: getAoiNames(state.aoi),
  selectedTiles: getSelectedTiles(state),
  highlightedTiles: getHighlightedTiles(state),
})

export default connect(
  mapStateToProps,
  {
    addTile,
    updateTile,
    addAoi,
    removeAoi,
    updateSession,
    addJob,
    updateJob,
    removeJob,
    updateMainSession,
    resetSessionState,
    updateAddAoiForm,
    thunkSendMessage,
    thunkAddJob,
    thunkCheckJobsForAoi,
    thunkUpdateCsrfTokens,
    thunkAddJobs,
  },
)(MainContainer)
