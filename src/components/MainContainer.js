import './../assets/css/MainContainer.css'
import './../assets/css/CenterContainer.css'

import React, { Component } from 'react';

import MapViewer from './MapViewer';
import AreaOfInterestList from './AreaOfInterestList';
import TimelineViewer from './TimelineViewer';
import TileList from './TileList';
import AddAreaOfInterestModal from './AddAreaOfInterestModal';
import FilteringTools from './FilteringTools';

import SimpleStorage, {clearStorage} from "react-simple-storage";

import moment from 'moment';

import base64 from 'base-64'

import {ipcRenderer} from 'electron'

const fs = require('fs')
import { Route, Link } from 'react-router-dom';
import { getS3LikeProviderBaseUrl } from 'builder-util-runtime';
import { exec } from 'builder-util';

// import * as util from 'util' // has no default export
import { inspect } from 'util' // or directly

// To use it, simply call

const { remote } = require ('electron');
const path = require ('path');

const resourcesPath = path.join(remote.app.getPath('userData'), 'localstorage.json')
console.log('Resource path for saving local data')
console.log(resourcesPath)

const defaultState = {
    show: false ,
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
      atmosphericCorrection: false
    }
}

// const JOB_MANAGER_SERVER_URL = 'http://zeus684440.agr.gc.ca:8080'
const JOB_MANAGER_SERVER_URL = 'http://localhost:9090'


export default class MainContainer extends Component {

  constructor(props) {
    super(props)
    console.log('maincontainer constructor running')

    // clear react simple storage (for debuggin and testing purposes)
    ipcRenderer.on('menu-item', (event, arg) => {
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
        const { history } = this.props;

        history.push('/settings')
      }
    });

    console.log(this.props.settings)
    this.state = {
      ...defaultState
      }
    console.log(`default state is ${this.state}`)
    console.log(this.state)
  }

  componentDidMount() {
    console.log('======================> Inside component did mount')

    this.loadFromLocalStorage()
    console.log(this.state)
    // Required for events outside the react lifecycle like refresh and quit
    window.addEventListener('beforeunload', this.cleanUpBeforeClose);

    window.addEventListener('keydown', this.handleKeyPress)
  }


  componentWillUnmount() {
    console.log('=================> Inside component will unmount')
    console.log(this.state)
    this.saveToLocalStorage()

    window.removeEventListener('beforeunload', this.cleanUpBeforeClose)

    const selectedTiles = this.state.selectedTiles;

    Object.keys(selectedTiles).map((date) => {
      selectedTiles[date].map((tile) => {
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
    console.log(this.state.aoi_list)
    let { activeAOI, selectedTiles, aoi_list, currentDate, tileDict } = this.state;
    console.log(currentDate)
    console.log('aoi_list')
    console.log(aoi_list)

    let currentAOIList = [...aoi_list]

    let jobDict = {}

    if (activeAOI !== null) {
      // Save the selcted tiles for later
      console.log(activeAOI)

      const aoi_index = this.getAoiIndex(activeAOI)

      let currentAOIObj = {...currentAOIList[aoi_index]}

      jobDict[activeAOI] = {
        'sentinel2': {},
        'landsat8': {}
      }

      for (let d of Object.keys(selectedTiles)) {
        selectedTiles[d].map((tile) => {
          // currentTile['job_id'] = response["id"]
          // currentTile['job_result'] = response['success'] ? 'success' : 'failed'
          // currentTile['job_status'] = jobStatusVerbose[response['status']]
          // currentTile['job_assigned'] = response['assigned']
          // currentTile['job_completed'] = response['completed']
          // currentTile["job_submitted"] = response["submitted"]
          // currentTile['job_result_message'] = response['result_message']
          // currentTile['times_checked'] += 1

          jobDict[activeAOI]['sentinel2'][tile.id] = {
            job_id: tile['job_id'],
            job_result: tile['job_result'],
            job_status: tile['job_status'],
            job_assigned: tile['job_assigned'],
            job_completed: tile['job_completed'],
            job_submitted: tile['job_submitted'],
            job_result_message: tile['job_result_message'],
            times_checked: tile['times_checked']
          }
        })
      }

      // Do a sensor specific check here (landsat, sentinel2)

      currentAOIObj['selectedTiles'] = {}

      currentAOIObj['cloudPercentFilter'] = this.state.cloudPercentFilter

      for (let d of Object.keys(selectedTiles)) {
        currentAOIObj['selectedTiles'][d] = selectedTiles[d].map((tile) => tile.id)
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
      jobDict: jobDict
    }
    console.log(jsonData)
    // Used to try and detect circular references
    // console.log(inspect(currentAoiList,  { showHidden: true, depth: null }))

    fs.writeFileSync(resourcesPath, JSON.stringify(jsonData));
    console.log('stringified AOI list successfully')
  }

  loadFromLocalStorage = () => {
    console.log('<<<<<<<<-------------------------------------- LOADING FROM LOCAL STORAGE');

    let activeAOI = localStorage.getItem('active_aoi') === null ? null : localStorage.getItem('active_aoi');

    let dataString = undefined
    let data = undefined

    if (fs.existsSync(resourcesPath)) {
      console.log('reading from file')
      dataString =  fs.readFileSync(resourcesPath, 'utf8');
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

    let aoi_list = data.aoi_list
    let tileDict = data.tileDict
    let jobDict = data.jobDict
    let cloudPercentFilter = 100
    console.log(aoi_list)

    if (aoi_list.length === 0) {
      activeAOI = null
    }
    console.log('previously active AOI')
    console.log(activeAOI)

    let populatedSelectedTiles = {}

    if (activeAOI !== null) {
      let currentAOI;
      aoi_list.forEach((ele) =>
      {
        console.log(ele.name)
        console.log(activeAOI)
        if(ele.name === activeAOI) {
          currentAOI = ele
        }
      })
      console.log(currentAOI)

      let tiles = currentAOI.tiles

      cloudPercentFilter = currentAOI.cloudPercentFilter
      console.log('build selected tiles object for tile list component')
      console.log(tiles)

      let selectedTiles = currentAOI.selectedTiles
      console.log(selectedTiles)

      for (let d of Object.keys(selectedTiles)) {
        console.log(d)
        console.log(selectedTiles[d])

        populatedSelectedTiles[d] = []

        selectedTiles[d].map((id) => {
          populatedSelectedTiles[d].push({
            ...tileDict[id],
            ...jobDict[activeAOI]['sentinel2'][id]
          })
        })
      }
    }

    console.log(jobDict)

    this.setState({
      activeAOI,
      aoi_list,
      currentTiles: [],
      selectedTiles: populatedSelectedTiles,
      allTiles: {},
      tileDict,
      jobDict,
      cloudPercentFilter
    },
    () => {
      if (activeAOI !== null) {
        this.activateAOI(activeAOI)
        console.log('Trying to resume checking job_status')
        this.resumeCheckingJobStatus()
      }
    });
  }

  componentDidUpdate(prevProps, prevState) {

  }

  resetState = () => {
    console.log('resetting state to defaults')
    try {
      fs.unlinkSync(resourcesPath)
      //file removed
    } catch(err) {
      console.error(err)
    }
    this.setState({...defaultState})
    this.props.resetSettings()
  }

  showModal = () => {
    this.setState({ show: true });
  };

  hideModal = () => {
    this.setState({ show: false });
  };

  clearLocalStorage = () => {
    localStorage.clear()
  }

  createCurrentTilesForDate = (date) => {


  }

  handleKeyPress = (event) => {
    console.log('key pressed')
    console.log(event.key)

    if (this.state.activeAOI !== null) {
      switch (event.key) {
        case "ArrowRight": {
          console.log("Right arrow pressed, incrementing date")
          this.incrementDate()
          break;
        }
        case "ArrowLeft": {
          console.log("Left arrow pressed, decrementing date")
          this.decrementDate()
          break;
        }
      }
    }
  }

  incrementDate = () => {
    console.log('increment date button pressed')
    if (!this.state.activeAOI)
      return

    console.log(this.state)
    let dateList = this.state.dateList
    let indexOfCurrentDate = dateList.indexOf(this.state.currentDate)
    console.log(dateList)
    console.log(this.state.allTiles)

    if (indexOfCurrentDate !== (dateList.length - 1)) {
      let newIndex = indexOfCurrentDate + 1;

      let newDate = dateList[newIndex]

      console.log('incrementDATE!')
      let allTiles = this.state.allTiles

      let aoi_list_copy = [...this.state.aoi_list]
      let activeAOIIndex = this.getAoiIndex(this.state.activeAOI)

      aoi_list_copy[activeAOIIndex]['currentDate'] = newDate

      this.setState({
        currentDate: newDate,
        currentTiles: [...allTiles[newDate]],
        aoi_list: aoi_list_copy
      },  () => {
        console.log(this.state.cloudPercentFilter)
        this.handleUpdateCloudFilter(this.state.cloudPercentFilter)
      })

    }
  }

  decrementDate = () => {
    console.log('decrement date pressed')
    if (!this.state.activeAOI)
      return

    let dateList = this.state.dateList
    let indexOfCurrentDate = dateList.indexOf(this.state.currentDate)
    console.log(dateList)

    if (indexOfCurrentDate !== 0) {
      let newIndex = indexOfCurrentDate - 1;
      let newDate = dateList[newIndex]

      let aoi_list_copy = [...this.state.aoi_list]
      let activeAOIIndex = this.getAoiIndex(this.state.activeAOI)

      aoi_list_copy[activeAOIIndex]['currentDate'] = newDate

      this.setState({
        currentDate: newDate,
        currentTiles: [...this.state.allTiles[newDate]],
        aoi_list: aoi_list_copy
      }, () => {
        this.handleUpdateCloudFilter(this.state.cloudPercentFilter)
      })
    }
  }

  addAreaOfInterest = (area) => {

    let aoiListTemp = [...this.state.aoi_list]
    let tileDictTemp = {...this.state.tileDict}

    const tiles = [...area.raw_tile_list]

    let sortedTiles = this.sortTilesByDate(tiles)
    let dateList = Object.keys(sortedTiles.datesObject)

    let datesObjectWithIds = {}
    let selectedInit = {}
    for (let d of dateList) {
      datesObjectWithIds[d] = sortedTiles.datesObject[d].map((ele) => ele.geojson.id)
      selectedInit[d] = []
      for (let t of sortedTiles.datesObject[d]) {
        console.log('===================================================')
        console.log(t)
        let idTemp = t.geojson.id
        t.geojson.properties.lowres_preview_url = t.lowres_preview_url
        console.log(t)
        tileDictTemp[idTemp] = {...t.geojson}
        tileDictTemp[idTemp]['id'] = idTemp
        tileDictTemp[idTemp]['selected'] = false
        tileDictTemp[idTemp]['visible'] = true
        tileDictTemp[idTemp]['date'] = t.date
      }
    }

    let areaSimple = {...area}

    delete areaSimple['raw_tile_list']

    areaSimple['tiles'] = datesObjectWithIds
    areaSimple['selectedTiles'] = selectedInit
    console.log(selectedInit)

    aoiListTemp.push(areaSimple)

    console.log('=========================================================================')
    console.log('aoi_list clone with area pushed')

    console.log(aoiListTemp)
    console.log(tileDictTemp)

    this.setState({
      aoi_list: aoiListTemp,
      tileDict: tileDictTemp
    })
  }

  resumeCheckingJobStatus = () => {
    // When starting up, check the job status of all tiles with (job id and job status of S or A)
    // Clear previous job_interval it exists

    let tiles = {...this.state.selectedTiles}
    console.log('Current Selected tiles')
    console.log(tiles)
    // Iterating over selected tiles
    Object.keys(tiles).map((ele) => {
      console.log(ele)
      console.log(tiles[ele])
      
      if (tiles[ele].length > 0) {
        console.log('found date with tiles')
        tiles[ele].map((tile) => {
          
          if (tile.hasOwnProperty('job_id')) {
            console.log('Checking tile job status')

            if (tile['job_check_interval'] !== null)
              clearInterval(tile['job_check_interval'])
            
              tile['job_check_interval'] = setInterval(() => this.checkJobStatus(tile['job_id'],
                                                                           tile.properties.name,
                                                                           ele), 1000 * 60)
          }
        })
      }
    })

    this.setState({
      selectedTiles: tiles
    })
  }

  activateAOI = (aoi_name) => {
    // When an AOI is clicked in the list, it is made active and passed to the map viewer
    console.log('YOU CLICKED AN AREA OF INTEREST')
    console.log(aoi_name)
    const newIndex = this.getAoiIndex(aoi_name)

    const prevIndex = this.getAoiIndex(this.state.activeAOI)

    let aoi_list = [...this.state.aoi_list]
    let activeAOI = {...aoi_list[newIndex]}
    let previousAOI = {...aoi_list[prevIndex]}
    const tileDict = {...this.state.tileDict}

    const jobDict = {...this.state.jobDict}

    console.log('JOB DICT:')
    console.log(jobDict)

    let selectedTiles = {}

    for (let d of Object.keys(this.state.selectedTiles)) {
      selectedTiles[d] = this.state.selectedTiles[d].map((ele) => ele.id)
    }

    previousAOI['selectedTiles'] = selectedTiles

    aoi_list[prevIndex] = previousAOI

    // Since the AOI is newly activated, lets put the current date to the first date.
    let newAllTiles = {}
    let newSelectedTiles = {}
    const dateList = Object.keys(activeAOI.tiles)
    let currentDate

    if (activeAOI['currentDate'] === undefined) {
      currentDate = dateList[0]
    } else {
      currentDate = activeAOI['currentDate']
    }

    if (prevIndex === newIndex) {
      activeAOI = previousAOI
    }

    // populate the selected tile list from the aoi entry
    const activeSelectedTiles = activeAOI['selectedTiles']
    const activeAllTiles = activeAOI['tiles']

    for (let d of Object.keys(activeSelectedTiles)) {
      newSelectedTiles[d] = activeSelectedTiles[d].map((id) => {
        return {
          ...tileDict[id],
          ...this.state.jobDict[aoi_name]['sentinel2'][id]
        }
      })
    }

    for (let d of Object.keys(activeAllTiles)) {
      newAllTiles[d] = activeAllTiles[d].map((id) => {
        return {...tileDict[id]}
      })
    }

    this.setState({
      activeAOI: aoi_name,
      currentTiles: newAllTiles[currentDate],
      allTiles: newAllTiles,
      selectedTiles: newSelectedTiles,
      dateList,
      currentDate,
      aoi_list,
    })
  }

  getCSRFToken = (callback, api, arg_list) => {
    let headers = new Headers();

    if (api === 'job_manager')
      fetch(`${this.props.settings.job_url}/generate_csrf/`, {
        method: 'GET',
        mode: 'cors',
        cache: 'default',
        headers: headers
      })
      .then(response => response.json())
      .then(response => {
        console.log('Success:', JSON.stringify(response))
        let csrf_obj = {}
        if (api === 'job_manager')
          csrf_obj["job_csrf_token"] = JSON.stringify(response)

        this.setState(csrf_obj);

        setTimeout(() => callback(...arg_list), 200)
      })
      .catch((err) =>
        console.log('something blew up')
      );
  }

  checkJobStatus = (job_id, tile_name, date) => {
    let jobStatusVerbose = {
      'C': 'completed',
      'A': 'assigned',
      'S': 'submitted'
    }

    console.log('Checking job status-----------------------------------------------------------')
    console.log(job_id, tile_name, date)
    let tiles = this.state.selectedTiles

    if (this.state.job_csrf_token === null) {

      this.getCSRFToken(this.checkJobStatus, 'job_manager', [job_id, tile_name, date])

    } else {


      let currentTile = tiles[date].find((ele) => ele.properties.name == tile_name)

      console.log(currentTile)

      console.log('INSIDE CHECK JOB STATUS!!!!!!')

      let headers = new Headers();
      headers.append("X-CSRFToken", this.state.job_csrf_token);
      headers.append("Content-Type", "application/json")

      headers.append("Authorization", `Basic ${base64.encode(`${'backup'}:${'12341234'}`)}`)

      fetch(`${this.props.settings.job_url}/jobs/${job_id}/`, {
        method: 'GET',
        headers: headers,
      })
      .then(response => response.json())
      .then(response => {
        console.log('Success:', JSON.stringify(response))
        console.log(currentTile)
        console.log(response)
        currentTile['job_id'] = response["id"]

        currentTile['job_result'] = response['success'] ? 'success' : 'failed'
        currentTile['job_status'] = jobStatusVerbose[response['status']]
        currentTile['job_assigned'] = response['assigned']
        currentTile['job_completed'] = response['completed']
        currentTile["job_submitted"] = response["submitted"]
        currentTile['job_result_message'] = response['result_message']
        currentTile['times_checked'] += 1

        console.log(currentTile['job_status'])
        if (currentTile['job_status'] === 'completed') {
          console.log('clearing the job status check')
          clearInterval(currentTile['job_check_interval'])
        }
        this.setState({
          selectedTiles: tiles
        })

      }).catch((err) => {
        console.log(err)
        console.log('something went wrong when trying to check the job')
      })

    }
  }

  selectAllVisibleTiles = () => {
    let currentTiles = [...this.state.currentTiles]
    let allTiles = {...this.state.allTiles}
    let selectedTiles = {...this.state.selectedTiles}
    let tileDict = {...this.state.tileDict}

    console.log(currentTiles)

    let tilesToSelect = currentTiles.filter((tile) => tile.visible)

    console.log(tilesToSelect)

    // find the relevant tile info first (to find the date)
    let allSelectedTiles = this.state.allSelectedTiles

    let currentDate = this.state.currentDate

    for (let t of tilesToSelect) {

      let relevantTile = currentTiles.find((ele) => ele.id == t.id)

      console.log(relevantTile)

      let previouslySelectedTiles = selectedTiles[currentDate].map((tile) => tile.id)

      console.log(previouslySelectedTiles)
      console.log(relevantTile.id)

      relevantTile.selected = true

      if (!previouslySelectedTiles.includes(relevantTile.id))
        selectedTiles[currentDate].push(relevantTile)

      tileDict[relevantTile.id].selected = true

    }

    allTiles[currentDate] = currentTiles

    this.setState({
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

    const tiles = this.state.selectedTiles

    if (this.state.job_csrf_token === null) {
      let headers = new Headers();

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
          job_csrf_token: JSON.stringify(response)
        });

        setTimeout(() => this.handleSubmitAllJobs(), 200)
      })
      .catch((err) =>
        console.log('something blew up')
      );

    } else {
      console.log('iterating over tiles to start jobs...')
      Object.keys(tiles).map((ele) => {
        console.log('Submitting job')
        console.log(ele)
        console.log(tiles[ele])
        if (tiles[ele].length > 0) {
          tiles[ele].map((tile) => {
            // if (tile.hasOwnProperty('job_id'))
            const jobReqBody = {
              label: "S2Download " + tile.properties.name,
              command: "not used",
              job_type: "S2Download",
              parameters: {
                options: {
                            tile: tile.properties.name,
                            ac: this.state.jobSettings.atmosphericCorrection,
                            ac_res: 10
                        }
              },
              priority: "3"
            }
            let headers = new Headers();
            headers.append("X-CSRFToken", this.state.job_csrf_token);
            headers.append("Content-Type", "application/json")

            headers.append("Authorization", `Basic ${base64.encode(`${'backup'}:${'12341234'}`)}`)

            fetch(`${this.props.settings.job_url}/jobs/`, {
              method: 'POST',
              body: JSON.stringify(jobReqBody),
              headers: headers,
            })
            .then(response => response.json())
            .then(response => {
              console.log('Success:', JSON.stringify(response))

              // Success: {"url":"http://localhost:9090/jobs/7b34635e-7d4b-45fc-840a-8c9de3251abc/","id":"7b34635e-7d4b-45fc-840a-8c9de3251abc","submitted":"2019-05-09T21:49:36.023959Z","label":"S2Download L1C_T12UUA_A015468_20180608T183731","command":"not used","job_type":"S2Download","parameters":{"options":{"tile":"L1C_T12UUA_A015468_20180608T183731","ac":true,"ac_res":10}},"priority":"3","owner":"backup"}
              // Todo update each tile with job info (id, status, success, workerid)
              tile['job_id'] = response["id"]
              tile['job_result'] = null
              tile['job_status'] = 'submitted'
              tile['job_assigned'] = null
              tile['job_completed'] = null
              tile["job_submitted"] = response["submitted"]

              console.log('STARTING PERIODIC JOB CHEKC~!!!!==============================================================================')
              tile['job_check_interval'] = setInterval(() => this.checkJobStatus(tile['job_id'],
                                                                           tile.properties['name'],
                                                                           ele), 1000 * 60)

              tile['times_checked'] = 0

              console.log(tile)

              this.setState({
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

  getAoiIndex = (aoi_name) => {
    // returning index instead of the object itself
    console.log(this.state.aoi_list)
    let name_list = this.state.aoi_list.map((ele) => ele['name'])
    let index = name_list.indexOf(aoi_name)
    return index
  }

  handleTileSelect = (tiles) => {
    console.log('this tile was selected')
    console.log(tiles)

    // find the relevant tile info first (to find the date)
    let currentDate = this.state.currentDate
    let currentTiles = [...this.state.allTiles[currentDate]]
    let allTiles = {...this.state.allTiles}
    let selectedTiles = {...this.state.selectedTiles}
    let selectedTilesInList = [...this.state.selectedTilesInList]

    console.log('selectedTiles')
    console.log(selectedTiles)

    let tileDict = {...this.state.tileDict}

    for (let t of tiles) {
      let tileCopy = {...tileDict[t]}
      console.log(tileCopy)

      tileCopy['selected'] = !tileCopy['selected']
      tileDict[t] = tileCopy

      let relevantTile = currentTiles.find((ele) => {
        return ele.id === t
      })

      relevantTile.selected = !relevantTile.selected

      if (relevantTile.selected) {
        selectedTiles[currentDate].push(relevantTile)

      } else {
        selectedTiles[currentDate] = selectedTiles[currentDate].filter( (ele) => {
          return ele.id !== relevantTile.id
        })
        if (selectedTilesInList.includes(relevantTile.id))
          selectedTilesInList = selectedTilesInList.filter((id) => id !== relevantTile.id)
      }
    }

    allTiles[currentDate] = currentTiles

    this.setState({
      currentDate,
      tileDict,
      allTiles,
      currentTiles,
      selectedTiles,
      selectedTilesInList
    })
  }

  removeDuplicates = (array) => {

  }

  handleTileClickedInList = (event, tileId) => {
    // if a tile is clicked in the list
    // currentDate should be changed to this tiles date
    // cyan blue highlight overlay should be added to indicate the most recently clicked tiles
    const selectedTiles = [...this.state.selectedTilesInList]
    const fullTile = {...this.state.tileDict[tileId]}
    const currentDate = this.state.currentDate
    const allTiles = this.state.allTiles
    const tileDate = moment(fullTile.date).format('YYYYMMDD')

    console.log('tile clicked in list')
    console.log(tileId)
    console.log(event.shiftKey)
    console.log(event.ctrlKey)

    let updatedSelectedTiles
    if (event.ctrlKey) {
      if (selectedTiles.includes(tileId))
        updatedSelectedTiles = selectedTiles.filter((id) => id !== tileId)
      else
        updatedSelectedTiles = [...selectedTiles, tileId]
    } else {
      if (selectedTiles.includes(tileId))
        updatedSelectedTiles = []
      else
        updatedSelectedTiles = [tileId]
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
      selectedTilesInList: updatedSelectedTiles,
      currentDate: newDate,
      currentTiles: [...allTiles[newDate]],
    })
  }

  removeTileFromSelected = (tileRemoved) => {
    console.log('remove tile was clicked')
    let allTiles = {...this.state.allTiles}
    let tileDict = {...this.state.tileDict}

    console.log(tileRemoved)

    let selectedTiles = {...this.state.selectedTiles}

    // get the tile date
    let dateString = moment(tileRemoved.date).format("YYYYMMDD")
    console.log(dateString)

    selectedTiles[dateString] = selectedTiles[dateString].filter((ele) => {
      return ele.id !== tileRemoved.id
    })

    allTiles[dateString].map((tile) => {
      if (tile.id === tileRemoved.id) {
        tile.selected = false
      }
      return tile
    })

    const currentTiles = allTiles[dateString]
    console.log(this.state.selectedTilesInList)

    let currentlySelectedTiles = [...this.state.selectedTilesInList]
    console.log(currentlySelectedTiles)

    currentlySelectedTiles = currentlySelectedTiles.filter((ele) => {
      return ele !== tileRemoved.id
    })

    console.log(currentlySelectedTiles)

    this.setState({
      selectedTiles,
      currentTiles,
      selectedTilesInList: currentlySelectedTiles,
      allTiles
    })
  }

  onKeyDown = (event) => {
    console.log(event.key)
  }

  handleUpdateCloudFilter = (cloud) => {
    if (!this.state.activeAOI)
      return
    console.log('User changed the filter % for cloud')
    console.log(cloud)


    let allTiles = {...this.state.allTiles}
    let tileDict = {...this.state.tileDict}
    console.log(allTiles)

    let currentTiles = [...allTiles[this.state.currentDate]]

    for (let tile of currentTiles) {
      if (parseFloat(tile.properties.cloud_percent) > parseFloat(cloud[0])) {
        tile.visible = false
        tileDict[tile.id].visible = false
      } else {
        tile.visible = true
        tileDict[tile.id].visible = true
      }
    }

    this.setState({
      allTiles,
      tileDict,
      currentTiles: allTiles[this.state.currentDate],
      cloudPercentFilter: cloud
    })
  }

  deselectCurrentDate = () => {

    if (!this.state.activeAOI)
      return

    let allTiles = {...this.state.allTiles}
    let tileDict = {...this.state.tileDict}
    let selectedTiles = {...this.state.selectedTiles}

    selectedTiles[this.state.currentDate] = []
    console.log(allTiles)

    let currentTiles = [...allTiles[this.state.currentDate]]

    for (let tile of currentTiles) {
        tile.selected = false
        tileDict[tile.id].selected = false
    }

    this.setState({
      allTiles,
      currentTiles: allTiles[this.state.currentDate],
      tileDict,
      selectedTiles
    })
  }

  updateJobSettings = (newSettings) => {
    console.log(newSettings)
    let testObject = {
      ...this.state.jobSettings,
      ...newSettings
    }
    console.log('new job settings')
    console.log(testObject)

    this.setState({
      jobSettings: {
        ...this.state.jobSettings,
        ...newSettings
      }
    })
  }

  handleTileSettingsUpdate = (newSettings) => {
    console.log('updated settings for the tile list are:')
    console.log(newSettings)
  }

  saveTileJson = () => {

    console.log('trying to save to json')
    const { dialog } = require('electron').remote
    console.log(dialog)
    dialog.showSaveDialog({defaultPath: "tilelist.json"}, (filename) => {
      if (filename) {
        const dateList = this.state.selectedTiles
        let tileList = {}
        for (let d in dateList) {
          if (dateList[d].length > 0) {
            let singleDateList = dateList[d].map((ele) => ele.properties.name)
            tileList[d] = singleDateList
          }
        }
        console.log(filename)
        console.log(tileList)
        fs.writeFileSync(filename, JSON.stringify(tileList));
        console.log('stringified AOI list successfully')
      }
    })

  }

  sortTilesByDate = (tiles) => {
    if (tiles) {
      let formatted_tiles = [];
      console.log('sorting tile by date')
      for (let raw_tile of tiles) {

        console.log(raw_tile)
        let proj = raw_tile.detailed_metadata.find((ele) => ele.fieldName === 'EPSG Code').value
        let start_date = moment(raw_tile.acquisition_start)
        let end_date = moment(raw_tile.acquisition_end)

        let mid_date_ts = (start_date.valueOf() + end_date.valueOf()) / 2

        let mid_date = moment(mid_date_ts)

        let tile = {
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
        const date = tile.date.format("YYYYMMDD")
        if (!groups[date]) {
          groups[date] =[]
        }
        groups[date].push(tile)
        return groups
      }, {});

      const groupArrays = Object.keys(groups).map((date) => {
        return {
          date,
          tiles: groups[date]
        };
      });

      console.log(groupArrays)
      console.log(groups)

      return {datesArray: groupArrays, datesObject: groups}

    } else {
      return {datesArray:[], datesObject: {}}
    }
  }

    render () {
      let wkt_footprint = null;
      // get AOI wkt from the currently active AOI
      console.log(this.state)
      console.log(this.state.activeAOI)

      if (this.state.activeAOI !== null) {
        const aoi_index = this.getAoiIndex(this.state.activeAOI)
        console.log(aoi_index)
        wkt_footprint = this.state.aoi_list[aoi_index].wkt_footprint
      }

      const areasOfInterests = this.state.aoi_list
      console.log(areasOfInterests)

      let cloudPercent = this.state.cloudPercentFilter

      return (
        <div className="mainContainer" ref="mainContainer">
          <AddAreaOfInterestModal show={this.state.show} hideModal={this.hideModal} addAreaOfInterest={this.addAreaOfInterest} settings={this.props.settings}/>
          <AreaOfInterestList addAreaModal={this.showModal} areasOfInterest={this.state.aoi_list} activateAOI={this.activateAOI} activeAOI={this.state.activeAOI} />
          <div className="centerContainer">
            <MapViewer tiles={this.state.currentTiles} tilesSelectedInList={this.state.selectedTilesInList} tileSelected={this.handleTileSelect} currentAoiWkt={wkt_footprint} activeAOI={this.state.activeAOI} currentDate={this.state.currentDate}/>
            <FilteringTools selectAll={this.selectAllVisibleTiles} deselectAll={this.deselectCurrentDate} updateCloudFilter={this.handleUpdateCloudFilter} cloudPercentFilter={cloudPercent}/>
            <TimelineViewer currentDate={this.state.currentDate} allTiles={this.state.allTiles} incrementDate={this.incrementDate} decrementDate={this.decrementDate}/>
          </div>
          <TileList settings={this.state.jobSettings} updateSettings={this.updateJobSettings} selectedTiles={this.state.selectedTiles} selectedTilesInList={this.state.selectedTilesInList} tileClicked={this.handleTileClickedInList} removeTile={this.removeTileFromSelected} submitAllJobs={this.handleSubmitAllJobs} saveTileJson={this.saveTileJson}/>
        </div>
      );
    }
}