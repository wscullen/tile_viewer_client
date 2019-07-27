import './../assets/css/MainContainer.css'
import './../assets/css/CenterContainer.css'

import React, { Component } from 'react'
import { connect } from "react-redux";

import { AppState } from '../store/'

import { TileState, Tile } from '../store/tile/types'
import { addTile } from '../store/tile/actions'

import { AreaOfInterestState, AreaOfInterest, TileList as TileListInterface, Session, CurrentDates } from '../store/aoi/types'
import { addAoi } from '../store/aoi/actions'

import { thunkSendMessage } from '../thunks'

import MapViewer from './MapViewer'
import AreaOfInterestList from './AreaOfInterestList'
import TimelineViewer from './TimelineViewer'
import TileList from './TileList'
import AddAreaOfInterestModal from './AddAreaOfInterestModal'
import FilteringTools from './FilteringTools'

import moment from 'moment'

//@ts-ignore
import base64 from 'base-64'

import { ipcRenderer } from 'electron'
import { MemoryHistory } from 'history';
import { unByKey } from 'ol/Observable';

const fs = require('fs') // or directly

// To use it, simply call

const remote = require('electron').remote

const path = require('path')

const resourcesPath = path.join(remote.app.getPath('userData'), 'localstorage.json')

console.log('Resource path for saving local data')
console.log(resourcesPath)

interface AppProps {
  addTile: typeof addTile;
  addAoi: typeof addAoi;
  aois: AreaOfInterestState;
  tiles: TileState;
  thunkSendMessage: any;
  history: MemoryHistory;
  settings: Object;
}

interface JobStatusVerbose {
  [key: string]: string;
  C: string;
  A: string;
  S: string;
}

interface DefaultAppState {
  show: boolean;
  aoi_list: Array<Object>;
  activeAOI: string;
  allTiles: Object;
  selectedTiles: {
    [key: string]: Object
  };
  selectedTilesInList: Array<string>;
  job_csrf_token: string;
  currentDate: string;
  tileDict: Object;
  cloudPercentFilter: number;
  jobSettings: {
    atmosphericCorrection: boolean;
  };
  enableSen2AgriL2A: boolean;
  enableSen2AgriL3A: boolean;
  enableSen2AgriL3B: boolean;
  sen2agri_l2a_job: Object;
  sen2agri_l3a_job: Object;
  sen2agri_l3b_job: Object;
}

const defaultState: DefaultAppState = {
  show: false,
  aoi_list: [],
  activeAOI: null,
  allTiles: {},
  selectedTiles: {

  },
  selectedTilesInList: [],
  job_csrf_token: null,
  currentDate: null,
  tileDict: {},
  cloudPercentFilter: 100,
  jobSettings: {
    atmosphericCorrection: false
  },
  enableSen2AgriL2A: false,
  enableSen2AgriL3A: false,
  enableSen2AgriL3B: false,
  sen2agri_l2a_job: {},
  sen2agri_l3a_job: {},
  sen2agri_l3b_job: {},
}

class MainContainer extends Component<AppProps, AppState> {
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
    })

    console.log(this.props.settings)
    this.state = {
      ...defaultState,
      ...this.state
    }
    console.log(`default state is ${this.state}`)
    console.log(this.state)
  }

  componentDidMount() {
    console.log('======================> Inside component did mount')

    this.loadFromLocalStorage()
    console.log(this.state)
    // Required for events outside the react lifecycle like refresh and quit
    window.addEventListener('beforeunload', this.cleanUpBeforeClose)
    //@ts-ignore
    window.addEventListener('keydown', this.handleKeyPress)
  }

  componentWillUnmount() {
    console.log('=================> Inside component will unmount')
    console.log(this.state)
    this.saveToLocalStorage()

    window.removeEventListener('beforeunload', this.cleanUpBeforeClose)

    //@ts-ignore
    const selectedTiles = this.state.selectedTiles

    Object.keys(selectedTiles).map((date) => {
      selectedTiles[date].map((tile: any) => {
        if (tile.hasOwnProperty('job_check_interval')) {
          console.log('CLEARING INTERVAL')
          clearInterval(tile['job_check_interval'])
        }
      })
    })
  }

  cleanUpBeforeClose = () => {
    this.saveToLocalStorage()

    localStorage.removeItem('initial_load')
  }

  saveToLocalStorage = () => {
    console.log('------------------------->>>>>>>>>>>>>>>>>>>>>>>>>> SAVING TO LOCAL STORAGE')
    //@ts-ignore
    console.log(this.state.aoi_list)
    //@ts-ignore
    const { activeAOI, selectedTiles, aoi_list, currentDate, tileDict, jobDict } = this.state
    console.log(currentDate)
    console.log('aoi_list')
    console.log(aoi_list)

    //@ts-ignore
    const { enableSen2AgriL2A, enableSen2AgriL3A, enableSen2AgriL3B, sen2agri_l2a_job, sen2agri_l3a_job, sen2agri_l3b_job } = this.state

    const currentAOIList = [...aoi_list]

    // Initialize jobDict
    aoi_list.map((aoi: Object) => {
      //@ts-ignore
      if (!jobDict.hasOwnProperty(aoi.name)) {
        //@ts-ignore
        jobDict[aoi.name] = {
          sentinel2: {},
          landsat8: {}
        }
      }
    })

    if (activeAOI !== null) {
      // Save the selcted tiles for later
      console.log(activeAOI)

      const aoi_index = this.getAoiIndex(activeAOI)

      const currentAOIObj = { ...currentAOIList[aoi_index] }

      for (const d of Object.keys(selectedTiles)) {
        selectedTiles[d].map((tile: Object) => {

          //@ts-ignore
          jobDict[activeAOI]['sentinel2'][tile.id] = {
            //@ts-ignore
            job_id: tile['job_id'],
            //@ts-ignore
            job_result: tile['job_result'],
            //@ts-ignore
            job_status: tile['job_status'],
            //@ts-ignore
            job_assigned: tile['job_assigned'],
            //@ts-ignore
            job_completed: tile['job_completed'],
            //@ts-ignore
            job_submitted: tile['job_submitted'],
            //@ts-ignore
            job_result_message: tile['job_result_message'],
            //@ts-ignore
            times_checked: tile['times_checked']
          }
        })
      }

      // Do a sensor specific check here (landsat, sentinel2)
      currentAOIObj['selectedTiles'] = {}
      //@ts-ignore
      currentAOIObj['cloudPercentFilter'] = this.state.cloudPercentFilter

      for (const d of Object.keys(selectedTiles)) {
        currentAOIObj['selectedTiles'][d] = selectedTiles[d].map((tile: any) => tile.id)
      }

      console.log('activeAOI is:')
      localStorage.setItem('active_aoi', activeAOI)

      currentAOIObj['currentDate'] = currentDate
      currentAOIList[aoi_index] = currentAOIObj
    }

    console.log('current settings!!!!!!!!!!!!!!!S')
    console.log(this.props.settings)

    localStorage.setItem('settings', JSON.stringify(this.props.settings))
    console.log('stringified settings successfully')
    console.log(currentAOIList)
    const jsonData = {
      aoi_list: currentAOIList,
      tileDict: tileDict,
      jobDict: jobDict,
      enableSen2AgriL2A,
      enableSen2AgriL3A,
      enableSen2AgriL3B,
      sen2agri_l2a_job,
      sen2agri_l3a_job,
      sen2agri_l3b_job
    }
    console.log(jsonData)
    // Used to try and detect circular references
    // console.log(inspect(currentAoiList,  { showHidden: true, depth: null }))

    fs.writeFileSync(resourcesPath, JSON.stringify(jsonData))
    console.log('stringified AOI list successfully')
  }

  loadFromLocalStorage = () => {
    console.log('<<<<<<<<-------------------------------------- LOADING FROM LOCAL STORAGE')

    let activeAOI = localStorage.getItem('active_aoi') === null ? null : localStorage.getItem('active_aoi')

    let dataString
    let data

    if (fs.existsSync(resourcesPath)) {
      console.log('reading from file')
      dataString = fs.readFileSync(resourcesPath, 'utf8')
      data = JSON.parse(dataString)
    }

    console.log(data)

    if (data === undefined) {
      data = {
        aoi_list: [],
        tileDict: {},
        jobDict: {}
      }
    }

    const aoi_list = data.aoi_list
    const tileDict = data.tileDict
    const jobDict = data.jobDict

    const { enableSen2AgriL2A,
      enableSen2AgriL3A,
      enableSen2AgriL3B,
      sen2agri_l2a_job,
      sen2agri_l3a_job,
      sen2agri_l3b_job } = data

    let cloudPercentFilter = 100
    console.log(aoi_list)

    if (aoi_list.length === 0) {
      activeAOI = null
    }
    console.log('previously active AOI')
    console.log(activeAOI)

    const populatedSelectedTiles = {}

    if (activeAOI !== null) {
      let currentAOI = {}
      aoi_list.forEach((ele: any) => {
        console.log(ele.name)
        console.log(activeAOI)
        if (ele.name === activeAOI) {
          currentAOI = ele
        }
      })
      console.log(currentAOI)
      //@ts-ignore
      const tiles = currentAOI.tiles
      //@ts-ignore
      cloudPercentFilter = currentAOI.cloudPercentFilter
      console.log('build selected tiles object for tile list component')
      console.log(tiles)
      //@ts-ignore
      const selectedTiles = currentAOI.selectedTiles
      console.log(selectedTiles)

      for (const d of Object.keys(selectedTiles)) {
        console.log(d)
        console.log(selectedTiles[d])
        //@ts-ignore
        populatedSelectedTiles[d] = []

        selectedTiles[d].map((id: string) => {
          //@ts-ignore
          populatedSelectedTiles[d].push({
            ...tileDict[id],
            ...jobDict[activeAOI]['sentinel2'][id]
          })
        })
      }
    }

    console.log(jobDict)

    this.setState({
      //@ts-ignore
      activeAOI,
      aoi_list,
      currentTiles: [],
      selectedTiles: populatedSelectedTiles,
      allTiles: {},
      tileDict,
      jobDict,
      cloudPercentFilter,
      enableSen2AgriL2A,
      enableSen2AgriL3A,
      enableSen2AgriL3B,
      sen2agri_l2a_job,
      sen2agri_l3a_job,
      sen2agri_l3b_job
    },
      () => {
        if (activeAOI !== null) {
          this.activateAOI(activeAOI)
          console.log('Trying to resume checking job_status')
          this.resumeCheckingJobStatus()
        }
      })
  }

  resetState = () => {
    console.log('resetting state to defaults')
    try {
      fs.unlinkSync(resourcesPath)
      // file removed
    } catch (err) {
      console.error(err)
    }
    //@ts-ignore
    this.setState({ ...defaultState })
    //@ts-ignore
    this.props.resetSettings()
  }

  showModal = () => {
    //@ts-ignore
    this.setState({ show: true })
  };

  hideModal = () => {
    //@ts-ignore
    this.setState({ show: false })
  };

  clearLocalStorage = () => {
    localStorage.clear()
  }

  handleKeyPress = (event: React.KeyboardEvent<HTMLElement>) => {
    console.log('key pressed')
    console.log(event.key)
    //@ts-ignore
    if (this.state.activeAOI !== null) {
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
      }
    }
  }

  incrementDate = () => {
    console.log('increment date button pressed')
    //@ts-ignore
    if (!this.state.activeAOI) { return }

    //@ts-ignore
    const dateList = this.state.dateList
    //@ts-ignore
    const indexOfCurrentDate = dateList.indexOf(this.state.currentDate)
    //@ts-ignore
    console.log(this.state.allTiles)

    if (indexOfCurrentDate !== (dateList.length - 1)) {
      const newIndex = indexOfCurrentDate + 1

      const newDate = dateList[newIndex]

      console.log('incrementDATE!')

      let currentAoi: AreaOfInterest

      this.props.aois.areasOfInterest.allIds.map((id: string) => {
        const aoi = this.props.aois.areasOfInterest.byId[id]
        //@ts-ignore
        if (aoi['name'] === this.state.activeAOI) { // TODO: create a SESSION reducer for current user session settings like activeAOI
          currentAoi = aoi
        }
      })
      console.log(currentAoi)

      //@ts-ignore
      const allTilesIds: Array<string> = currentAoi['allTiles'][currentAoi.session.currentPlatform][newDate]
      console.log(allTilesIds)
      const allTiles = allTilesIds.map((id) => {
        return this.props.tiles.tiles.byId[id]
      })
      console.log('allTiles')
      console.log(allTiles)
      //@ts-ignore
      const aoi_list_copy = [...this.state.aoi_list]
      //@ts-ignore
      const activeAOIIndex = this.getAoiIndex(this.state.activeAOI)
      aoi_list_copy[activeAOIIndex]['currentDate'] = newDate

      this.setState({
        //@ts-ignore
        currentDate: newDate,
        //@ts-ignore
        currentTiles: [...allTiles],
        aoi_list: aoi_list_copy
      }, () => {
        //@ts-ignore
        this.handleUpdateCloudFilter(this.state.cloudPercentFilter)
      })
    }
  }

  decrementDate = () => {
    console.log('decrement date pressed')
    //@ts-ignore
    if (!this.state.activeAOI) { return }
    //@ts-ignore
    const dateList = this.state.dateList
    //@ts-ignore
    const indexOfCurrentDate = dateList.indexOf(this.state.currentDate)
    console.log(dateList)

    if (indexOfCurrentDate !== 0) {
      const newIndex = indexOfCurrentDate - 1
      const newDate = dateList[newIndex]
      //@ts-ignore
      const aoi_list_copy = [...this.state.aoi_list]
      //@ts-ignore
      const activeAOIIndex = this.getAoiIndex(this.state.activeAOI)
      aoi_list_copy[activeAOIIndex]['currentDate'] = newDate

      this.setState({
        //@ts-ignore
        currentDate: newDate,
        //@ts-ignore
        currentTiles: [...this.state.allTiles[newDate]],
        aoi_list: aoi_list_copy
      }, () => {
        //@ts-ignore
        this.handleUpdateCloudFilter(this.state.cloudPercentFilter)
      })
    }
  }

  addAreaOfInterest = (area: any) => {

    //@ts-ignore
    const aoiListTemp = [...this.state.aoi_list]
    //@ts-ignore
    const tileDictTemp = { ...this.state.tileDict }
    //@ts-ignore
    const jobDict = { ...this.state.jobDict }

    const allTileId: TileListInterface = {
      'sentinel2': {},
      'landsat8': {}
    }

    const currentDates: CurrentDates = {
      landsat8: {
        currentDate: "",
        dates: []
      },
      sentinel2: {
        currentDate: "",
        dates: []
      },
    }

    const sensorList: Array<string> = []

    const selectedTileId: TileListInterface = {
      'landsat8': {},
      'sentinel2': {}
     }

    for (const key of Object.keys(area.raw_tile_list)) {
      //@ts-ignore
      const tiles = area.raw_tile_list[key]
      const sortedTiles = this.sortTilesByDate(tiles)
      const dateList = Object.keys(sortedTiles.datesObject)

      sensorList.push(key)
      const datesObjectWithIds = {}
      const selectedInit = {}

      for (const d of dateList) {
        //@ts-ignore
        datesObjectWithIds[d] = sortedTiles.datesObject[d].map((ele) => ele.geojson.id)
        //@ts-ignore
        selectedInit[d] = []

        let tileIds: Array<string> = []

        //@ts-ignore
        for (const t of sortedTiles.datesObject[d]) {
          console.log('===================================================')
          console.log(t)
          const idTemp = t.geojson.id
          t.geojson.properties.lowres_preview_url = t.lowres_preview_url
          console.log(t)
          tileDictTemp[idTemp] = { ...t.geojson }
          tileDictTemp[idTemp]['id'] = idTemp
          tileDictTemp[idTemp]['selected'] = false
          tileDictTemp[idTemp]['visible'] = true
          tileDictTemp[idTemp]['date'] = t.date

          const tile: Tile = {
            ...t.geojson,
            selected: false,
            visible: true,
            highlighted: false,
            jobs: []
          }

          this.props.addTile(tile)

          tileIds.push(idTemp)
        }

        allTileId[key][d] = tileIds
        currentDates[key]['dates'] = Object.keys(allTileId[key])
        currentDates[key]['currentDate'] = Object.keys(allTileId[key])[0]
      }
    }

    const session: Session = {
      cloudPercentFilter: 100,
      datesList: currentDates,
      currentPlatform: "sentinel2"
    }

    const areaObject: AreaOfInterest = {
      id: area['id'],
      endDate: area['endDate'],
      startDate: area['startDate'],
      mgrsList: area['mgrs_list'],
      wrsList: area['wrs_list'],
      wrsOverlay: area['wrs_overlay'],
      dateCreated: new Date().toISOString(),
      session,
      name: area['name'],
      wktFootprint: area['wkt_footprint'],
      jobs: [],
      allTiles: allTileId,
      selectedTiles: selectedTileId,
      sensorList: area['sensor_list'],
    }

    const areaSimple = { ...area }

    jobDict[areaSimple.name] = {
      sentinel2: {},
      landsat8: {}
    }

    delete areaSimple['raw_tile_list']
    const currentPlatform = session.currentPlatform
    const currentDate = session.datesList[currentPlatform]['currentDate']
    areaSimple['tiles'] = allTileId[session.currentPlatform][currentDate]
    areaSimple['selectedTiles'] = selectedTileId

    aoiListTemp.push(areaSimple)

    console.log('=========================================================================')
    console.log('aoi_list clone with area pushed')

    console.log(aoiListTemp)
    console.log(tileDictTemp)

    this.props.addAoi(areaObject)

    this.setState({
      //@ts-ignore
      aoi_list: aoiListTemp,
      tileDict: tileDictTemp,
      jobDict
    })
  }

  resumeCheckingJobStatus = () => {
    // When starting up, check the job status of all tiles with (job id and job status of S or A)
    // Clear previous job_interval it exists

    //@ts-ignore
    const tiles = { ...this.state.selectedTiles }
    console.log('Current Selected tiles')
    console.log(tiles)
    // Iterating over selected tiles
    Object.keys(tiles).map((ele) => {
      console.log(ele)
      console.log(tiles[ele])

      if (tiles[ele].length > 0) {
        console.log('found date with tiles')
        tiles[ele].map((tile: any) => {
          if (tile && tile.hasOwnProperty('job_id')) {
            console.log('Checking tile job status')

            if (tile['job_check_interval'] !== null) { clearInterval(tile['job_check_interval']) }

            tile['job_check_interval'] = setInterval(() => this.checkJobStatus(tile['job_id'],
              tile.properties.name,
              ele), 1000 * 60)
          }
        })
      }
    })
    //@ts-ignore
    const l2a_job = this.state.sen2agri_l2a_job

    if (l2a_job && l2a_job.hasOwnProperty('job_status')) {
      l2a_job['job_check_interval'] = setInterval(() => this.checkSen2AgriL2AJobStatus(l2a_job['job_id']), 1000 * 60)
    }
    //@ts-ignore
    const l3a_job = this.state.sen2agri_l3a_job

    if (l3a_job && l3a_job.hasOwnProperty('job_status')) {
      l3a_job['job_check_interval'] = setInterval(() => this.checkSen2AgriL3AJobStatus(l3a_job['job_id']), 1000 * 60)
    }
    //@ts-ignore
    const l3b_job = this.state.sen2agri_l3b_job

    if (l3b_job && l3b_job.hasOwnProperty('job_status')) {
      l3b_job['job_check_interval'] = setInterval(() => this.checkSen2AgriL3BJobStatus(l3b_job['job_id']), 1000 * 60)
    }

    this.setState({
      //@ts-ignore
      selectedTiles: tiles,
      sen2agri_l2a_job: l2a_job,
      sen2agri_l3a_job: l3a_job,
      sen2agri_l3b_job: l3b_job
    })
  }

  toggleVisibility = (tileId: any) => {
    console.log(tileId)
    //@ts-ignore
    const allTiles = { ...this.state.allTiles }
    //@ts-ignore
    const selectedTiles = { ...this.state.selectedTiles }
    //@ts-ignore
    const tileDict = { ...this.state.tileDict }
    //@ts-ignore
    const currentTiles = [...allTiles[this.state.currentDate]]

    for (const idx in currentTiles) {
      if (currentTiles[idx]['id'] === tileId) {
        console.log('found match in currentTiles!')
        const updatedTile = { ...currentTiles[idx] }

        updatedTile['visible'] = !currentTiles[idx]['visible']

        // console.log(t.visible)
        currentTiles[idx] = updatedTile
        tileDict[updatedTile.id] = updatedTile
        // console.log(updatedTile)
      }
    }
    //@ts-ignore
    const selectedCurrentTiles = [...selectedTiles[this.state.currentDate]]

    for (const tile of selectedCurrentTiles) {
      if (tile['id'] === tileId) {
        console.log('found match in selectedCurrentTiles!')
        console.log(tile)
        tile.visible = !tile.visible
        console.log(tile)
      }
    }
    //@ts-ignore
    selectedTiles[this.state.currentDate] = selectedCurrentTiles
    //@ts-ignore
    allTiles[this.state.currentDate] = currentTiles

    console.log(selectedTiles)
    console.log(currentTiles)

    this.setState({
      //@ts-ignore
      tileDict,
      selectedTiles,
      currentTiles,
      allTiles
    })
  }

  activateAOI = (aoi_name: string) => {
    // When an AOI is clicked in the list, it is made active and passed to the map viewer
    console.log('YOU CLICKED AN AREA OF INTEREST')
    console.log(aoi_name)
    const newIndex = this.getAoiIndex(aoi_name)
    //@ts-ignore
    const prevIndex = this.getAoiIndex(this.state.activeAOI)
    //@ts-ignore
    const aoi_list = [...this.state.aoi_list]
    let activeAOI = { ...aoi_list[newIndex] }
    const previousAOI = { ...aoi_list[prevIndex] }
    //@ts-ignore
    const tileDict = { ...this.state.tileDict }
    //@ts-ignore
    const jobDict = { ...this.state.jobDict }

    console.log('JOB DICT:')
    console.log(jobDict)

    const selectedTiles = {}
    //@ts-ignore
    for (const d of Object.keys(this.state.selectedTiles)) {
      //@ts-ignore
      selectedTiles[d] = this.state.selectedTiles[d].map((ele) => ele.id)
    }

    previousAOI['selectedTiles'] = selectedTiles

    aoi_list[prevIndex] = previousAOI

    // Since the AOI is newly activated, lets put the current date to the first date.
    const newAllTiles = {}
    const newSelectedTiles = {}

    if (prevIndex === newIndex) {
      activeAOI = previousAOI
    }

    console.log(activeAOI)
    let areasOfInterest = { ...this.props.aois.areasOfInterest.byId }
    console.log(areasOfInterest)
    let areaOfInterest: AreaOfInterest

    Object.keys(areasOfInterest).map((id: string) => {
      if (areasOfInterest[id]['name'] === aoi_name) {
        areaOfInterest = areasOfInterest[id]
      }
    })
    console.log('___aoi: ')
    console.log(areaOfInterest)

    const session = areaOfInterest['session']
    const currentPlatform = session['currentPlatform']

    const dateList = areaOfInterest.session.datesList[currentPlatform].dates
    const currentDate = areaOfInterest.session.datesList[currentPlatform].currentDate

    // populate the selected tile list from the aoi entry
    const activeSelectedTiles = areaOfInterest['selectedTiles'][currentPlatform]
    const activeAllTiles = areaOfInterest['allTiles'][currentPlatform]

    for (const d of Object.keys(activeSelectedTiles)) {
      //@ts-ignore
      newSelectedTiles[d] = activeSelectedTiles[d].map((id) => {
        return {
          ...tileDict[id],
          ...jobDict[aoi_name]['sentinel2'][id]
        }
      })
    }

    for (const d of Object.keys(activeAllTiles)) {
      //@ts-ignore
      newAllTiles[d] = activeAllTiles[d].map((id) => {
        return { ...tileDict[id] }
      })
    }
    // for newly activated AOI the cloudPercentFilter will be unpopulated
    //@ts-ignore
    const cloudPercentFilter = activeAOI['cloudPercentFilter'] ? activeAOI['cloudPercentFilter'] : this.state.cloudPercentFilter

    this.setState({
      //@ts-ignore
      activeAOI: aoi_name,
      //@ts-ignore
      currentTiles: newAllTiles[currentDate],
      allTiles: newAllTiles,
      selectedTiles: newSelectedTiles,
      dateList,
      currentDate,
      aoi_list,
      cloudPercentFilter
    })
  }

  getCSRFToken = (callback: Function, api: string, arg_list: any) => {
    const headers = new Headers()

    if (api === 'job_manager') {
      //@ts-ignore
      fetch(`${this.props.settings.job_url}/generate_csrf/`, {
        method: 'GET',
        mode: 'cors',
        cache: 'default',
        headers: headers
      })
        .then(response => response.json())
        .then(response => {
          console.log('Success:', JSON.stringify(response))
          const csrf_obj = {}
          //@ts-ignore
          if (api === 'job_manager') { csrf_obj['job_csrf_token'] = JSON.stringify(response) }

          this.setState(csrf_obj)

          setTimeout(() => callback(...arg_list), 200)
        })
        .catch((err) =>
          console.log('something blew up')
        )
    }
  }

  checkJobStatus = (job_id: string, tile_name: string, date: string) => {
    const jobStatusVerbose = {
      C: 'completed',
      A: 'assigned',
      S: 'submitted'
    }

    console.log('Checking job status-----------------------------------------------------------')
    console.log(job_id, tile_name, date)
    //@ts-ignore
    const tiles = this.state.selectedTiles
    //@ts-ignore
    if (this.state.job_csrf_token === null) {
      this.getCSRFToken(this.checkJobStatus, 'job_manager', [job_id, tile_name, date])
    } else {
      const currentTile = tiles[date].find((ele: any) => ele.properties.name == tile_name)

      const headers = new Headers()
      //@ts-ignore
      headers.append('X-CSRFToken', this.state.job_csrf_token)
      headers.append('Content-Type', 'application/json')

      headers.append('Authorization', `Basic ${base64.encode(`${'backup'}:${'12341234'}`)}`)
      //@ts-ignore
      fetch(`${this.props.settings.job_url}/jobs/${job_id}/`, {
        method: 'GET',
        headers: headers
      })
        .then(response => response.json())
        .then(response => {
          console.log('Success:', JSON.stringify(response))
          console.log(currentTile)
          console.log(response)
          currentTile['job_id'] = response['id']

          currentTile['job_result'] = response['success'] ? 'success' : 'failed'
          //@ts-ignore
          currentTile['job_status'] = jobStatusVerbose[response['status']]
          currentTile['job_assigned'] = response['assigned']
          currentTile['job_completed'] = response['completed']
          currentTile['job_submitted'] = response['submitted']
          currentTile['job_result_message'] = response['result_message']
          currentTile['times_checked'] += 1

          console.log(currentTile['job_status'])
          let allJobsDone = false

          if (currentTile['job_status'] === 'completed') {
            console.log('clearing the job status check')
            clearInterval(currentTile['job_check_interval'])
            allJobsDone = true

            Object.keys(tiles).map((ele) => {
              if (tiles[ele].length > 0) {
                tiles[ele].map((t: any) => {
                  //@ts-ignore
                  if (t['job_status'] !== jobStatusVerbose[response['status']] && t['job_result'] !== 'success') {
                    allJobsDone = false
                  }
                })
              }
            })
          }

          this.setState({
            //@ts-ignore
            selectedTiles: tiles,
            enableSen2AgriL2A: allJobsDone
          })
        }).catch((err) => {
          console.log(err)
          console.log('something went wrong when trying to check the job')
        })
    }
  }

  checkSen2AgriL2AJobStatus = (job_id: string) => {
    const jobStatusVerbose = {
      C: 'completed',
      A: 'assigned',
      S: 'submitted'
    }

    //@ts-ignore
    if (this.state.job_csrf_token === null) {
      this.getCSRFToken(this.checkSen2AgriL2AJobStatus, 'job_manager', [job_id])
    } else {
      const headers = new Headers()
      //@ts-ignore
      headers.append('X-CSRFToken', this.state.job_csrf_token)
      headers.append('Content-Type', 'application/json')

      headers.append('Authorization', `Basic ${base64.encode(`${'backup'}:${'12341234'}`)}`)
      //@ts-ignore
      fetch(`${this.props.settings.job_url}/jobs/${job_id}/`, {
        method: 'GET',
        headers: headers
      })
        .then(response => response.json())
        .then(response => {
          console.log('Success:', JSON.stringify(response))
          console.log(response)
          //@ts-ignore
          const sen2agri_job_status = this.state.sen2agri_l2a_job

          sen2agri_job_status['job_id'] = response['id']

          sen2agri_job_status['job_result'] = response['success'] ? 'success' : 'failed'
          //@ts-ignore
          sen2agri_job_status['job_status'] = jobStatusVerbose[response['status']]
          sen2agri_job_status['job_assigned'] = response['assigned']
          sen2agri_job_status['job_completed'] = response['completed']
          sen2agri_job_status['job_submitted'] = response['submitted']
          sen2agri_job_status['job_result_message'] = response['result_message']
          sen2agri_job_status['times_checked'] += 1

          let enableL3Other = false

          if (sen2agri_job_status['job_status'] === 'completed') {
            enableL3Other = true
          }

          this.setState({
            //@ts-ignore
            sen2agri_l2a_job: sen2agri_job_status,
            enableSen2AgriL3A: enableL3Other,
            enableSen2AgriL3B: enableL3Other
          })
        }).catch((err) => {
          console.log(err)
          console.log('something went wrong when trying to check the job')
        })
    }
  }

  checkSen2AgriL3AJobStatus = (job_id: string) => {
    const jobStatusVerbose: JobStatusVerbose = {
      C: 'completed',
      A: 'assigned',
      S: 'submitted'
    }

    //@ts-ignore
    if (this.state.job_csrf_token === null) {
      this.getCSRFToken(this.checkSen2AgriL3AJobStatus, 'job_manager', [job_id])
    } else {
      const headers = new Headers()
      //@ts-ignore

      headers.append('X-CSRFToken', this.state.job_csrf_token)
      headers.append('Content-Type', 'application/json')

      headers.append('Authorization', `Basic ${base64.encode(`${'backup'}:${'12341234'}`)}`)
      //@ts-ignore
      fetch(`${this.props.settings.job_url}/jobs/${job_id}/`, {
        method: 'GET',
        headers: headers
      })
        .then(response => response.json())
        .then(response => {
          console.log('Success:', JSON.stringify(response))
          console.log(response)
          //@ts-ignore
          const sen2agri_job_status = this.state.sen2agri_l3a_job

          sen2agri_job_status['job_id'] = response['id']

          sen2agri_job_status['job_result'] = response['success'] ? 'success' : 'failed'
          sen2agri_job_status['job_status'] = jobStatusVerbose[response['status']]
          sen2agri_job_status['job_assigned'] = response['assigned']
          sen2agri_job_status['job_completed'] = response['completed']
          sen2agri_job_status['job_submitted'] = response['submitted']
          sen2agri_job_status['job_result_message'] = response['result_message']
          sen2agri_job_status['times_checked'] += 1

          this.setState({
            //@ts-ignore
            sen2agri_l3a_job: sen2agri_job_status
          })
        }).catch((err) => {
          console.log(err)
          console.log('something went wrong when trying to check the job')
        })
    }
  }

  checkSen2AgriL3BJobStatus = (job_id: string) => {
    const jobStatusVerbose: JobStatusVerbose = {
      C: 'completed',
      A: 'assigned',
      S: 'submitted'
    }

    //@ts-ignore
    if (this.state.job_csrf_token === null) {
      this.getCSRFToken(this.checkSen2AgriL3BJobStatus, 'job_manager', [job_id])
    } else {
      const headers = new Headers()
      //@ts-ignore
      headers.append('X-CSRFToken', this.state.job_csrf_token)
      headers.append('Content-Type', 'application/json')

      headers.append('Authorization', `Basic ${base64.encode(`${'backup'}:${'12341234'}`)}`)
      //@ts-ignore
      fetch(`${this.props.settings.job_url}/jobs/${job_id}/`, {
        method: 'GET',
        headers: headers
      })
        .then(response => response.json())
        .then(response => {
          console.log('Success:', JSON.stringify(response))
          console.log(response)
          //@ts-ignore
          const sen2agri_job_status = this.state.sen2agri_l3b_job

          sen2agri_job_status['job_id'] = response['id']

          sen2agri_job_status['job_result'] = response['success'] ? 'success' : 'failed'
          sen2agri_job_status['job_status'] = jobStatusVerbose[response['status']]
          sen2agri_job_status['job_assigned'] = response['assigned']
          sen2agri_job_status['job_completed'] = response['completed']
          sen2agri_job_status['job_submitted'] = response['submitted']
          sen2agri_job_status['job_result_message'] = response['result_message']
          sen2agri_job_status['times_checked'] += 1

          this.setState({
            //@ts-ignore
            sen2agri_l3b_job: sen2agri_job_status
          })
        }).catch((err) => {
          console.log(err)
          console.log('something went wrong when trying to check the job')
        })
    }
  }

  selectAllVisibleTiles = () => {
    //@ts-ignore
    const currentTiles = [...this.state.currentTiles]
    //@ts-ignore
    const allTiles = { ...this.state.allTiles }
    //@ts-ignore
    const selectedTiles = { ...this.state.selectedTiles }
    //@ts-ignore
    const tileDict = { ...this.state.tileDict }

    console.log(currentTiles)

    const tilesToSelect = currentTiles.filter((tile) => tile.visible)

    console.log(tilesToSelect)

    // find the relevant tile info first (to find the date)
    //@ts-ignore
    const allSelectedTiles = this.state.allSelectedTiles
    //@ts-ignore
    const currentDate = this.state.currentDate

    for (const t of tilesToSelect) {
      const relevantTile = currentTiles.find((ele) => ele.id == t.id)

      console.log(relevantTile)

      const previouslySelectedTiles = selectedTiles[currentDate].map((tile: any) => tile.id)

      console.log(previouslySelectedTiles)
      console.log(relevantTile.id)

      relevantTile.selected = true

      if (!previouslySelectedTiles.includes(relevantTile.id)) { selectedTiles[currentDate].push(relevantTile) }

      tileDict[relevantTile.id].selected = true
    }

    allTiles[currentDate] = currentTiles

    this.setState({
      //@ts-ignore
      selectedTiles,
      tileDict,
      currentTiles,
      allTiles
    })
  }

  handleSubmitAllJobs = () => {
    console.log('submitting all jobs for selected tiles')

    //   POST request to job_manager API
    //   {
    //     "url": "http://localhost:8989/jobs/8a61655d-7c3f-488d-b615-45c1fac96bd8/",
    //     "id": "8a61655d-7c3f-488d-b615-45c1fac96bd8",
    //     "submitted": "2019-05-06T23:17:54.016613Z",
    //     "label": "S2Download L1C_T12UWV_A015525_20180612T181639",
    //     "command": "not used",
    //     "job_type": "S2Download",
    //     "parameters": {
    //         "options": {
    //             "tile": "L1C_T12UWV_A015525_20180612T181639",
    //             "ac": true,
    //             "ac_res": 10
    //         }
    //     },
    //     "priority": "3",
    //     "owner": "backup"
    // }
    //   requires label, command, job_type, parameters, priority, MUST be authenticated

    // "Authorization": `Basic ${base64.encode(`${login}:${password}`)}`

    //@ts-ignore
    const tiles = this.state.selectedTiles
    //@ts-ignore
    if (this.state.job_csrf_token === null) {
      const headers = new Headers()
      //@ts-ignore
      fetch(`${this.props.settings.job_url}/generate_csrf/`, {
        method: 'GET',
        mode: 'cors',
        cache: 'default',
        headers: headers
      })
        .then(response => response.json())
        .then(response => {
          console.log('Success:', JSON.stringify(response))
          this.setState({
            //@ts-ignore
            job_csrf_token: JSON.stringify(response)
          })

          setTimeout(() => this.handleSubmitAllJobs(), 200)
        })
        .catch((err) =>
          console.log('something blew up')
        )
    } else {
      console.log('iterating over tiles to start jobs...')
      Object.keys(tiles).map((ele) => {
        console.log('Submitting job')
        console.log(ele)
        console.log(tiles[ele])
        if (tiles[ele].length > 0) {
          tiles[ele].map((tile: any) => {
            // if (tile.hasOwnProperty('job_id'))
            const jobReqBody = {
              label: 'S2Download ' + tile.properties.name,
              command: 'not used',
              job_type: 'S2Download',
              parameters: {
                options: {
                  tile: tile.properties.name,
                  //@ts-ignore
                  ac: this.state.jobSettings.atmosphericCorrection,
                  ac_res: 10
                }
              },
              priority: '3'
            }
            const headers = new Headers()
            //@ts-ignore
            headers.append('X-CSRFToken', this.state.job_csrf_token)
            headers.append('Content-Type', 'application/json')

            headers.append('Authorization', `Basic ${base64.encode(`${'backup'}:${'12341234'}`)}`)
            //@ts-ignore
            fetch(`${this.props.settings.job_url}/jobs/`, {
              method: 'POST',
              body: JSON.stringify(jobReqBody),
              headers: headers
            })
              .then(response => response.json())
              .then(response => {
                console.log('Success:', JSON.stringify(response))

                // Success: {"url":"http://localhost:9090/jobs/7b34635e-7d4b-45fc-840a-8c9de3251abc/","id":"7b34635e-7d4b-45fc-840a-8c9de3251abc","submitted":"2019-05-09T21:49:36.023959Z","label":"S2Download L1C_T12UUA_A015468_20180608T183731","command":"not used","job_type":"S2Download","parameters":{"options":{"tile":"L1C_T12UUA_A015468_20180608T183731","ac":true,"ac_res":10}},"priority":"3","owner":"backup"}
                // Todo update each tile with job info (id, status, success, workerid)
                tile['job_id'] = response['id']
                tile['job_result'] = null
                tile['job_status'] = 'submitted'
                tile['job_assigned'] = null
                tile['job_completed'] = null
                tile['job_submitted'] = response['submitted']

                console.log('STARTING PERIODIC JOB CHEKC~!!!!==============================================================================')
                tile['job_check_interval'] = setInterval(() => this.checkJobStatus(tile['job_id'],
                  tile.properties['name'],
                  ele), 1000 * 60)

                tile['times_checked'] = 0

                console.log(tile)

                this.setState({
                  //@ts-ignore
                  allSelectedTiles: tiles
                })
              }).catch((err) => {
                console.log(err)
                console.log('something went wrong when trying to submit the job')
              })
          })
        }
      })
    }
  }

  getAoiIndex = (aoi_name: string): number => {
    // returning index instead of the object itself
    //@ts-ignore
    console.log(this.state.aoi_list)
    //@ts-ignore
    const name_list = this.state.aoi_list.map((ele: any) => ele['name'])
    const index = name_list.indexOf(aoi_name)
    return index
  }

  handleTileSelect = (tiles: Array<any>) => {
    console.log('this tile was selected')
    console.log(tiles)
    //@ts-ignore
    const currentDate = this.state.currentDate
    //@ts-ignore
    const currentTiles = [...this.state.allTiles[currentDate]]
    //@ts-ignore
    const allTiles = { ...this.state.allTiles }
    //@ts-ignore
    const selectedTiles = { ...this.state.selectedTiles }
    //@ts-ignore
    let selectedTilesInList = [...this.state.selectedTilesInList]

    console.log('selectedTiles')
    console.log(selectedTiles)
    //@ts-ignore
    const tileDict = { ...this.state.tileDict }

    for (const t of tiles) {
      const tileCopy = { ...tileDict[t] }
      console.log(tileCopy)

      tileCopy['selected'] = !tileCopy['selected']
      tileDict[t] = tileCopy

      const relevantTile = currentTiles.find((ele) => {
        return ele.id === t
      })

      relevantTile.selected = !relevantTile.selected

      if (relevantTile.selected) {
        selectedTiles[currentDate].push(relevantTile)
      } else {
        selectedTiles[currentDate] = selectedTiles[currentDate].filter((ele: any) => {
          return ele.id !== relevantTile.id
        })
        if (selectedTilesInList.includes(relevantTile.id)) { selectedTilesInList = selectedTilesInList.filter((id) => id !== relevantTile.id) }
      }
    }

    allTiles[currentDate] = currentTiles

    this.setState({
      //@ts-ignore
      currentDate,
      tileDict,
      allTiles,
      currentTiles,
      selectedTiles,
      selectedTilesInList
    })
  }

  handleTileClickedInList = (event: React.MouseEvent<HTMLElement>, tileId: string) => {
    // if a tile is clicked in the list
    // currentDate should be changed to this tiles date
    // cyan blue highlight overlay should be added to indicate the most recently clicked tiles
    //@ts-ignore
    const selectedTiles = [...this.state.selectedTilesInList]
    //@ts-ignore
    const fullTile = { ...this.state.tileDict[tileId] }
    //@ts-ignore
    const currentDate = this.state.currentDate
    //@ts-ignore
    const allTiles = this.state.allTiles
    const tileDate = moment(fullTile.date).format('YYYYMMDD')

    console.log('tile clicked in list')
    console.log(tileId)
    console.log(event.shiftKey)
    console.log(event.ctrlKey)

    let updatedSelectedTiles
    if (event.ctrlKey) {
      if (selectedTiles.includes(tileId)) { updatedSelectedTiles = selectedTiles.filter((id) => id !== tileId) } else { updatedSelectedTiles = [...selectedTiles, tileId] }
    } else {
      if (selectedTiles.includes(tileId)) { updatedSelectedTiles = [] } else { updatedSelectedTiles = [tileId] }
    }

    let newDate
    if (currentDate !== tileDate) {
      console.log('currentDate and tileDate is different')
      newDate = tileDate
      updatedSelectedTiles = [tileId]
    } else {
      newDate = currentDate
    }

    this.setState({
      //@ts-ignore
      selectedTilesInList: updatedSelectedTiles,
      currentDate: newDate,
      currentTiles: [...allTiles[newDate]]
    })
  }

  removeTileFromSelected = (tileRemoved: any) => {
    console.log('remove tile was clicked')
    //@ts-ignore
    const allTiles = { ...this.state.allTiles }
    //@ts-ignore
    const tileDict = { ...this.state.tileDict }

    //@ts-ignore
    const selectedTiles = { ...this.state.selectedTiles }

    // get the tile date
    const dateString = moment(tileRemoved.date).format('YYYYMMDD')
    console.log(dateString)

    selectedTiles[dateString] = selectedTiles[dateString].filter((ele: any) => {
      return ele.id !== tileRemoved.id
    })

    allTiles[dateString].map((tile: any) => {
      if (tile.id === tileRemoved.id) {
        tile.selected = false
      }
      return tile
    })

    const currentTiles = allTiles[dateString]
    //@ts-ignore
    console.log(this.state.selectedTilesInList)
    //@ts-ignore
    let currentlySelectedTiles = [...this.state.selectedTilesInList]
    console.log(currentlySelectedTiles)

    currentlySelectedTiles = currentlySelectedTiles.filter((ele) => {
      return ele !== tileRemoved.id
    })

    console.log(currentlySelectedTiles)

    this.setState({
      //@ts-ignore
      selectedTiles,
      currentTiles,
      selectedTilesInList: currentlySelectedTiles,
      allTiles
    })
  }

  handleUpdateCloudFilter = (cloud: string) => {
    // console.log(cloud)
    // //@ts-ignore
    // if (!this.state.activeAOI) { return }

    // console.log('User changed the filter % for cloud')
    // console.log(cloud)
    // //@ts-ignore
    // const allTiles = { ...this.state.allTiles }
    // //@ts-ignore
    // const selectedTiles = { ...this.state.selectedTiles }
    // //@ts-ignore
    // const tileDict = { ...this.state.tileDict }
    // //@ts-ignore
    // const currentTiles = [...allTiles[this.state.currentDate]]

    // for (const tile of currentTiles) {
    //   if (parseFloat(tile.properties.cloud_percent) > parseFloat(cloud)) {
    //     tile.visible = false
    //     tileDict[tile.id].visible = false
    //   } else {
    //     tile.visible = true
    //     tileDict[tile.id].visible = true
    //   }
    // }
    // //@ts-ignore
    // const selectedCurrentTiles = [...selectedTiles[this.state.currentDate]]

    // for (const tile of selectedCurrentTiles) {
    //   tile['visible'] = tileDict[tile['id']].visible
    //   console.log('updating selected tiles')
    //   console.log(tile)
    // }
    // //@ts-ignore
    // selectedTiles[this.state.currentDate] = selectedCurrentTiles

    // this.setState({
    //   //@ts-ignore
    //   tileDict,
    //   selectedTiles,
    //   //@ts-ignore
    //   currentTiles: allTiles[this.state.currentDate],
    //   cloudPercentFilter: cloud
    // })
  }

  deselectCurrentDate = () => {
    //@ts-ignore
    if (!this.state.activeAOI) { return }
    //@ts-ignore
    const allTiles = { ...this.state.allTiles }
    //@ts-ignore
    const tileDict = { ...this.state.tileDict }
    //@ts-ignore
    const selectedTiles = { ...this.state.selectedTiles }
    //@ts-ignore
    selectedTiles[this.state.currentDate] = []
    console.log(allTiles)
    //@ts-ignore
    const currentTiles = [...allTiles[this.state.currentDate]]

    for (const tile of currentTiles) {
      tile.selected = false
      tileDict[tile.id].selected = false
    }

    this.setState({
      //@ts-ignore
      allTiles,
      //@ts-ignore
      currentTiles: allTiles[this.state.currentDate],
      tileDict,
      selectedTiles
    })
  }

  updateJobSettings = (newSettings: any) => {
    console.log(newSettings)
    const testObject = {
      //@ts-ignore
      ...this.state.jobSettings,
      ...newSettings
    }
    console.log('new job settings')
    console.log(testObject)

    this.setState({
      //@ts-ignore
      jobSettings: {
        //@ts-ignore
        ...this.state.jobSettings,
        ...newSettings
      }
    })
  }

  getTileList = () => {
    const tileList = {}
    //@ts-ignore
    const dateList = this.state.selectedTiles

    for (const d in dateList) {
      if (dateList[d].length > 0) {
        const singleDateList = dateList[d].map((ele: any) => ele.properties.name)
        //@ts-ignore
        tileList[d] = singleDateList
      }
    }

    return tileList
  }

  saveTileJson = () => {
    console.log('trying to save to json')
    const { dialog } = require('electron').remote
    console.log(dialog)
    dialog.showSaveDialog({ defaultPath: 'tilelist.json' }, (filename) => {
      if (filename) {
        const tileList = this.getTileList()
        console.log(filename)
        console.log(tileList)
        fs.writeFileSync(filename, JSON.stringify(tileList))
        console.log('stringified AOI list successfully')
      }
    })
  }

  submitSen2agriL2A = () => {
    console.log('trying to submit sen2agri l2a job')

    // get tile List
    const tiles = this.getTileList()
    //@ts-ignore
    if (this.state.job_csrf_token === null) {
      const headers = new Headers()
      //@ts-ignore
      fetch(`${this.props.settings.job_url}/generate_csrf/`, {
        method: 'GET',
        mode: 'cors',
        cache: 'default',
        headers: headers
      })
        .then(response => response.json())
        .then(response => {
          console.log('Success:', JSON.stringify(response))
          this.setState({
            //@ts-ignore
            job_csrf_token: JSON.stringify(response)
          })

          setTimeout(() => this.submitSen2agriL2A, 200)
        })
        .catch((err) =>
          console.log('something blew up')
        )
    } else {
      const jobReqBody = {
        label: 'Sen2agri L2A JOb',
        command: 'na',
        job_type: 'Sen2Agri_L2A',
        parameters: {
          imagery_list: tiles
        },
        priority: '3'
      }
      const headers = new Headers()
      //@ts-ignore
      headers.append('X-CSRFToken', this.state.job_csrf_token)
      headers.append('Content-Type', 'application/json')

      headers.append('Authorization', `Basic ${base64.encode(`${'backup'}:${'12341234'}`)}`)
      //@ts-ignore
      fetch(`${this.props.settings.job_url}/jobs/`, {
        method: 'POST',
        body: JSON.stringify(jobReqBody),
        headers: headers
      })
        .then(response => response.json())
        .then(response => {
          console.log('Success:', JSON.stringify(response))

          // // Success: {"url":"http://localhost:9090/jobs/7b34635e-7d4b-45fc-840a-8c9de3251abc/","id":"7b34635e-7d4b-45fc-840a-8c9de3251abc","submitted":"2019-05-09T21:49:36.023959Z","label":"S2Download L1C_T12UUA_A015468_20180608T183731","command":"not used","job_type":"S2Download","parameters":{"options":{"tile":"L1C_T12UUA_A015468_20180608T183731","ac":true,"ac_res":10}},"priority":"3","owner":"backup"}
          // // Todo update each tile with job info (id, status, success, workerid)
          // tile['job_id'] = response["id"]
          // tile['job_result'] = null
          // tile['job_status'] = 'submitted'
          // tile['job_assigned'] = null
          // tile['job_completed'] = null
          // tile["job_submitted"] = response["submitted"]
          //@ts-ignore
          const job_status = {}
          //@ts-ignore
          job_status['job_id'] = response['id']
          //@ts-ignore
          job_status['job_result'] = null
          //@ts-ignore
          job_status['job_status'] = 'submitted'
          //@ts-ignore
          job_status['job_assigned'] = null
          //@ts-ignore
          job_status['job_completed'] = null
          //@ts-ignore
          job_status['job_submitted'] = response['submitted']

          console.log('STARTING PERIODIC JOB CHEKC~!!!!=================================================================')
          //@ts-ignore
          job_status['job_check_interval'] = setInterval(() => this.checkSen2AgriL2AJobStatus(job_status['job_id']), 1000 * 60)
          //@ts-ignore
          job_status['times_checked'] = 0

          this.setState({
            //@ts-ignore
            sen2agri_l2a_job: job_status
          })
        }).catch((err) => {
          console.log(err)
          console.log('something went wrong when trying to submit the job')
        })
    }
  }

  submitSen2agriL3A = () => {
    console.log('trying to submit sen2agri l3a job')
    // get tile List
    const tiles = this.getTileList()
    //@ts-ignore
    if (this.state.job_csrf_token === null) {
      const headers = new Headers()
      //@ts-ignore
      fetch(`${this.props.settings.job_url}/generate_csrf/`, {
        method: 'GET',
        mode: 'cors',
        cache: 'default',
        headers: headers
      })
        .then(response => response.json())
        .then(response => {
          console.log('Success:', JSON.stringify(response))
          this.setState({
            //@ts-ignore
            job_csrf_token: JSON.stringify(response)
          })

          setTimeout(() => this.submitSen2agriL3A, 200)
        })
        .catch((err) =>
          console.log('something blew up')
        )
    } else {
      const jobReqBody = {
        label: 'Sen2agri L3A JOb',
        command: 'na',
        job_type: 'Sen2Agri_L3A',
        parameters: {
          imagery_list: tiles,
          //@ts-ignore
          aoi_name: this.state.activeAOI,
          window_size: 30
        },
        priority: '3'
      }
      const headers = new Headers()
      //@ts-ignore
      headers.append('X-CSRFToken', this.state.job_csrf_token)
      headers.append('Content-Type', 'application/json')

      headers.append('Authorization', `Basic ${base64.encode(`${'backup'}:${'12341234'}`)}`)
      //@ts-ignore
      fetch(`${this.props.settings.job_url}/jobs/`, {
        method: 'POST',
        body: JSON.stringify(jobReqBody),
        headers: headers
      })
        .then(response => response.json())
        .then(response => {
          console.log('Success:', JSON.stringify(response))

          // // Success: {"url":"http://localhost:9090/jobs/7b34635e-7d4b-45fc-840a-8c9de3251abc/","id":"7b34635e-7d4b-45fc-840a-8c9de3251abc","submitted":"2019-05-09T21:49:36.023959Z","label":"S2Download L1C_T12UUA_A015468_20180608T183731","command":"not used","job_type":"S2Download","parameters":{"options":{"tile":"L1C_T12UUA_A015468_20180608T183731","ac":true,"ac_res":10}},"priority":"3","owner":"backup"}
          // // Todo update each tile with job info (id, status, success, workerid)
          // tile['job_id'] = response["id"]
          // tile['job_result'] = null
          // tile['job_status'] = 'submitted'
          // tile['job_assigned'] = null
          // tile['job_completed'] = null
          // tile["job_submitted"] = response["submitted"]

          const job_status = {}
          //@ts-ignore
          job_status['job_id'] = response['id']
          //@ts-ignore
          job_status['job_result'] = null
          //@ts-ignore
          job_status['job_status'] = 'submitted'
          //@ts-ignore
          job_status['job_assigned'] = null
          //@ts-ignore
          job_status['job_completed'] = null
          //@ts-ignore
          job_status['job_submitted'] = response['submitted']

          console.log('STARTING PERIODIC JOB CHEKC~!!!!==============================================================================')
          //@ts-ignore
          job_status['job_check_interval'] = setInterval(() => this.checkSen2AgriL3AJobStatus(job_status['job_id']), 1000 * 60)
          //@ts-ignore
          job_status['times_checked'] = 0

          this.setState({
            //@ts-ignore
            sen2agri_l3a_job: job_status
          })
        }).catch((err) => {
          console.log(err)
          console.log('something went wrong when trying to submit the job')
        })
    }
  }

  submitSen2agriL3B = () => {
    console.log('trying to submit sen2agri l3b job')
    const tiles = this.getTileList()
    //@ts-ignore
    if (this.state.job_csrf_token === null) {
      const headers = new Headers()
      //@ts-ignore
      fetch(`${this.props.settings.job_url}/generate_csrf/`, {
        method: 'GET',
        mode: 'cors',
        cache: 'default',
        headers: headers
      })
        .then(response => response.json())
        .then(response => {
          console.log('Success:', JSON.stringify(response))
          this.setState({
            //@ts-ignore
            job_csrf_token: JSON.stringify(response)
          })

          setTimeout(() => this.submitSen2agriL3A, 200)
        })
        .catch((err) =>
          console.log('something blew up')
        )
    } else {
      const jobReqBody = {
        label: 'Sen2agri L3B JOb',
        command: 'na',
        job_type: 'Sen2Agri_L3A',
        parameters: {
          imagery_list: tiles,
          //@ts-ignore
          aoi_name: this.state.activeAOI
        },
        priority: '3'
      }
      const headers = new Headers()
      //@ts-ignore
      headers.append('X-CSRFToken', this.state.job_csrf_token)
      headers.append('Content-Type', 'application/json')

      headers.append('Authorization', `Basic ${base64.encode(`${'backup'}:${'12341234'}`)}`)
      //@ts-ignore
      fetch(`${this.props.settings.job_url}/jobs/`, {
        method: 'POST',
        body: JSON.stringify(jobReqBody),
        headers: headers
      })
        .then(response => response.json())
        .then(response => {
          console.log('Success:', JSON.stringify(response))

          // // Success: {"url":"http://localhost:9090/jobs/7b34635e-7d4b-45fc-840a-8c9de3251abc/","id":"7b34635e-7d4b-45fc-840a-8c9de3251abc","submitted":"2019-05-09T21:49:36.023959Z","label":"S2Download L1C_T12UUA_A015468_20180608T183731","command":"not used","job_type":"S2Download","parameters":{"options":{"tile":"L1C_T12UUA_A015468_20180608T183731","ac":true,"ac_res":10}},"priority":"3","owner":"backup"}
          // // Todo update each tile with job info (id, status, success, workerid)
          // tile['job_id'] = response["id"]
          // tile['job_result'] = null
          // tile['job_status'] = 'submitted'
          // tile['job_assigned'] = null
          // tile['job_completed'] = null
          // tile["job_submitted"] = response["submitted"]

          const job_status = {}
          //@ts-ignore
          job_status['job_id'] = response['id']
          //@ts-ignore
          job_status['job_result'] = null
          //@ts-ignore
          job_status['job_status'] = 'submitted'
          //@ts-ignore
          job_status['job_assigned'] = null
          //@ts-ignore
          job_status['job_completed'] = null
          //@ts-ignore
          job_status['job_submitted'] = response['submitted']

          console.log('STARTING PERIODIC JOB CHEKC~!!!!===========================================================')
          //@ts-ignore
          job_status['job_check_interval'] = setInterval(() => this.checkSen2AgriL3BJobStatus(job_status['job_id']), 1000 * 60)
          //@ts-ignore
          job_status['times_checked'] = 0

          this.setState({
            //@ts-ignore
            sen2agri_l3b_job: job_status
          })
        }).catch((err) => {
          console.log(err)
          console.log('something went wrong when trying to submit the job')
        })
    }
  }

  sortTilesByDate = (tiles: any) => {
    if (tiles) {
      const formatted_tiles = []
      console.log('sorting tile by date')
      for (const raw_tile of tiles) {
        console.log(raw_tile)
        const proj = raw_tile.detailed_metadata.find((ele: any) => ele.fieldName === 'EPSG Code').value
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
          geojson: raw_tile['geojson']
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

      const groupArrays = Object.keys(groups).map((date) => {
        return {
          date,
          //@ts-ignore
          tiles: groups[date]
        }
      })

      console.log(groupArrays)
      console.log(groups)

      return { datesArray: groupArrays, datesObject: groups }
    } else {
      return { datesArray: [], datesObject: {} }
    }
  }

  render() {
    let wkt_footprint = null
    let wrsOverlay = null
    // get AOI wkt from the currently active AOI
    console.log(this.state)
    //@ts-ignore
    console.log(this.state.activeAOI)
    //@ts-ignore
    if (this.state.activeAOI !== null) {
      //@ts-ignore
      const aoi_index = this.getAoiIndex(this.state.activeAOI)
      console.log(aoi_index)
      //@ts-ignore
      wkt_footprint = this.state.aoi_list[aoi_index].wkt_footprint
      //@ts-ignore
      wrsOverlay = this.state.aoi_list[aoi_index].wrs_overlay
      console.log('WRS OVERLAY')
      console.log(wrsOverlay)
    }
    //@ts-ignore
    const areasOfInterests = this.state.aoi_list
    console.log(areasOfInterests)
    //@ts-ignore
    const cloudPercent = this.state.cloudPercentFilter

    let currentAoi: AreaOfInterest

    const aois = this.props.aois.areasOfInterest.allIds.map((id: string) => {
      const aoi = this.props.aois.areasOfInterest.byId[id]

      //@ts-ignore
      if (aoi['name'] === this.state.activeAOI) { // TODO: create a SESSION reducer for current user session settings like activeAOI
        currentAoi = aoi
      }
      return this.props.aois.areasOfInterest.byId[id]
    })

    const selectedTiles = currentAoi ? currentAoi['selectedTiles'] : {}

    return (
      <div className='mainContainer' ref='mainContainer'>
        {/*
        // @ts-ignore */}
        <AddAreaOfInterestModal show={this.state.show} hideModal={this.hideModal} addAreaOfInterest={this.addAreaOfInterest} settings={this.props.settings} />
        {/*
        // @ts-ignore */}
        <AreaOfInterestList addAreaModal={this.showModal} areasOfInterest={aois} activateAOI={this.activateAOI} activeAOI={this.state.activeAOI} />
        <div className='centerContainer'>
          {/*
          // @ts-ignore */}
          <MapViewer tiles={this.state.currentTiles} tilesSelectedInList={this.state.selectedTilesInList} tileSelected={this.handleTileSelect} currentAoiWkt={wkt_footprint} wrsOverlay={wrsOverlay} activeAOI={this.state.activeAOI} currentDate={this.state.currentDate} />
          {/*
          // @ts-ignore */}
          <FilteringTools selectAll={this.selectAllVisibleTiles} deselectAll={this.deselectCurrentDate} updateCloudFilter={this.handleUpdateCloudFilter} cloudPercentFilter={cloudPercent} />
          {/*
          // @ts-ignore */}
          <TimelineViewer currentDate={this.state.currentDate} allTiles={this.state.allTiles} incrementDate={this.incrementDate} decrementDate={this.decrementDate} />
        </div>
        {/*
        // @ts-ignore */}
        <TileList settings={this.state.jobSettings} updateSettings={this.updateJobSettings} selectedTiles={selectedTiles} selectedTilesInList={this.state.selectedTilesInList} tileClicked={this.handleTileClickedInList} removeTile={this.removeTileFromSelected} submitAllJobs={this.handleSubmitAllJobs} saveTileJson={this.saveTileJson} submitSen2agriL2A={this.submitSen2agriL2A} enableSen2agriL2A={this.state.enableSen2AgriL2A} submitSen2agriL3A={this.submitSen2agriL3A} enableSen2agriL3A={this.state.enableSen2AgriL3A} submitSen2agriL3B={this.submitSen2agriL3B} enableSen2agriL3B={this.state.enableSen2AgriL3B} sen2agriL2AJob={this.state.sen2agri_l2a_job} sen2agriL3AJob={this.state.sen2agri_l3a_job} sen2agriL3BJob={this.state.sen2agri_l3b_job} toggleTileVisibility={this.toggleVisibility} />
      </div>
    )
  }
}

const mapStateToProps = (state: AppState) => ({
  tiles: state.tile,
  aois: state.aoi
})

export default connect(
  mapStateToProps,
  {
    addTile,
    addAoi,
    thunkSendMessage
  }
)(MainContainer);
