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

let execPath;

execPath = path.join(process.resourcesPath, '..')
const resourcesPath = path.join(execPath, 'localstorage.json')


console.log(execPath)

const defaultState = {
    show: false ,
    aoi_list: [],
    activeAOI: null,
    allSelectedTiles: {},
    currentlySelectedTiles: [],
    job_csrf_token: null,
    currentDate: null,
    tileDict: {}
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

  }


  componentWillUnmount() {
    console.log('=================> Inside component will unmount')
    console.log(this.state)
    this.saveToLocalStorage()

    window.removeEventListener('beforeunload', this.cleanUpBeforeClose)
  }

  cleanUpBeforeClose = () => {
    this.saveToLocalStorage()

    localStorage.removeItem('initial_load')
  }

  saveToLocalStorage = () => {
    console.log('------------------------->>>>>>>>>>>>>>>>>>>>>>>>>> SAVING TO LOCAL STORAGE')
    console.log(this.state.aoi_list)
    let { activeAOI, allSelectedTiles, aoi_list, currentDate, tileDict } = this.state;
    console.log('aoi_list')
    console.log(aoi_list)

    let currentAoiList = []
    aoi_list.map((ele) => {
      console.log(ele)
      currentAoiList.push(Object.assign(ele))
    })

    if (activeAOI !== null) {
      // Save the selcted tiles for later
      console.log(activeAOI)

      const aoi_index = this.getAoiIndex(activeAOI)
      console.log(aoi_list[aoi_index])
      let currentAOI = aoi_list[aoi_index]
      console.log('activeAOI is:')
      console.log(currentAOI)
      let simplifiedAllSelectedTiles = {}
      for (let dateArray in allSelectedTiles) {
        let idArray = allSelectedTiles[dateArray].map((tile) => {
          tile.id
        })
        simplifiedAllSelectedTiles[dateArray] = idArray
      }

      console.log(simplifiedAllSelectedTiles)

      currentAOI['allSelectedTiles'] = simplifiedAllSelectedTiles
      console.log(currentAOI)

      console.log('allSelectedTiles')
      console.log(allSelectedTiles)
      console.log('aoi_list before')
      console.log(currentAoiList)
      currentAoiList[aoi_index] = currentAOI
      console.log(currentAoiList)

      console.log('currentAOIList')
      console.log(currentAOI)

      localStorage.setItem('active_aoi', activeAOI)

    }

    if (currentDate !== null)
      localStorage.setItem('current_date', currentDate)

    console.log('current settings!!!!!!!!!!!!!!!S')
    console.log(this.props.settings)

    localStorage.setItem('settings', JSON.stringify(this.props.settings))
    console.log('stringified settings successfully')
    console.log(currentAoiList)
    const jsonData = {
      aoi_list: currentAoiList,
      tileDict: tileDict
    }
    console.log(jsonData)
    console.log(inspect(currentAoiList,  { showHidden: true, depth: null }))

    fs.writeFileSync(path.join(execPath, 'localstorage.json'), JSON.stringify(jsonData));
    console.log('stringified AOI list successfully')
  }

  loadFromLocalStorage = () => {
    console.log('<<<<<<<<-------------------------------------- LOADING FROM LOCAL STORAGE');

    let activeAOI = localStorage.getItem('active_aoi') === null ? null : localStorage.getItem('active_aoi');

    let currentDate = localStorage.getItem('current_date') === null  ? null : localStorage.getItem('current_date');

    let dataString = undefined
    let data = undefined

    if (fs.existsSync(path.join(execPath, 'localstorage.json'))) {
      console.log('reading from file')
      dataString =  fs.readFileSync(path.join(execPath, 'localstorage.json'), 'utf8');
      data = JSON.parse(dataString)
    }

    console.log(data)

     if (data === undefined) {
        data = {
          aoi_list: [],
          tileDict: {}
        }
     }

    let aoi_list = data.aoi_list
    let tileDict = data.tileDict
    console.log(aoi_list)

    let allSelectedTiles = {}

    if (aoi_list.length === 0) {
      currentDate = null
      activeAOI = null
    }

    console.log(activeAOI)

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
    }
    console.log(allSelectedTiles)
    console.log('--------------------------->>>>>> SETTINGS')

    console.log(activeAOI)
    console.log(allSelectedTiles)
    console.log(currentDate)

    this.setState({
      activeAOI,
      currentDate,
      aoi_list,
      currentTiles: [],
      allTiles: {},
      tileDict
    },
    () => {
      if (activeAOI !== null)
        this.activateAOI(activeAOI)
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
      })
    }
  }

  addAreaOfInterest = (area) => {

    let tileDict = this.state.tileDict
    let aoiListTemp = []

    this.state.aoi_list.map((ele) => {
      aoiListTemp.push({...ele})
    })

    let tileDictTemp = {}

    Object.keys(this.state.tileDict).map((id) => {
      tileDictTemp[id] = {...this.state.tileDict[id]}
    })

    const tiles = [...area.raw_tile_list]

    let sortedTiles = this.sortTilesByDate(tiles)
    let dateList = Object.keys(sortedTiles.datesObject)

    let datesObjectWithIds = {}
    for (let d of dateList) {
      datesObjectWithIds[d] = sortedTiles.datesObject[d].map((ele) => ele.geojson.id)
    }

    let areaSimple = {...area}

    delete areaSimple['raw_tile_list']

    areaSimple['tiles'] = datesObjectWithIds
    console.log(areaSimple)

    for (let t of tiles) {
      console.log(t)
      let idTemp = t.geojson.id
      t.geojson.properties.lowres_preview_url = t.preview_url
      console.log(t)
      tileDictTemp[idTemp] = {...t.geojson}
      tileDictTemp[idTemp]['id'] = idTemp
      tileDictTemp[idTemp]['selected'] = false
      tileDictTemp[idTemp]['visible'] = true

      console.log('TILE ADDING AREA')
      console.log(tileDictTemp[idTemp])
    }
    console.log(datesObjectWithIds)

    console.log('aoi dict temp')
    console.log(tileDictTemp)

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

  activateAOI = (aoi_name) => {
    // When an AOI is clicked in the list, it is made active and passed to the map viewer
    console.log('YOU CLICKED AN AREA OF INTEREST')
    console.log(aoi_name)

    const newIndex = this.getAoiIndex(aoi_name)
    const prevIndex = this.getAoiIndex(this.state.activeAOI)
    console.log(newIndex)
    console.log(prevIndex)

    console.log(activeAOI)
    let aoi_list = this.state.aoi_list
    console.log(aoi_list)
    const activeAOI = {...aoi_list[newIndex]}
    console.log('ACTIVE AOI =--------------------')
    console.log(activeAOI)
    console.log(newIndex)

    console.log('Sorting tiles by date...')
    // Since the AOI is newly activated, lets put the current date to the first date.

    let allTiles = {}
    let dateList = Object.keys(activeAOI['tiles'])
    console.log(dateList)

    let currentDate
    if (activeAOI['currentDate'] === undefined) {
      currentDate = dateList[0]
    } else {
      currentDate = activeAOI['currentDate']
    }

    for (let d of dateList) {
      allTiles[d] = []
      for (let id of activeAOI['tiles'][d]) {
        allTiles[d].push( {...this.state.tileDict[id]})
      }
    }

    console.log('AOI LIST IN ACTIVATE AOI FUNCTION=============================')
    console.log(aoi_list)
    console.log('ALL TILES LIST REBUILT')
    console.log(allTiles)

    this.setState({
      activeAOI: aoi_name,
      currentTiles: allTiles[currentDate],
      allTiles: allTiles,
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
    let tiles = this.state.allSelectedTiles

    if (this.state.job_csrf_token === null) {

      getCSRFToken(checkJobStatus, 'job_manager', [job_id, tile_name, date])

    } else {


      let currentTile = tiles[date].find((ele) => ele.name == tile_name)

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

        if (currentTile['job_status'] === 'completed')
          clearInterval(currentTile['job_check_interval'])

        this.setState({
          allSelectedTiles: tiles
        })

      }).catch((err) => {
        console.log(err)
        console.log('something went wrong when trying to check the job')
      })

    }
  }

  selectAllVisibleTiles = () => {
    let currentTiles = this.state.allTiles[this.state.currentDate]

    console.log(currentTiles)

    let tilesToSelect = currentTiles.filter((tile) => tile.visible).map((tile) => tile.name)

    console.log(tilesToSelect)

    // find the relevant tile info first (to find the date)
    let allSelectedTiles = this.state.allSelectedTiles

    let currentDate = this.state.currentDate

    for (let t of tilesToSelect) {

      let relevantTile = currentTiles.find((ele) => ele.name == t)
      console.log(relevantTile)

      let previouslySelectedTiles = allSelectedTiles[currentDate].map((tile) => tile.name)
      console.log(previouslySelectedTiles)
      console.log(relevantTile.name)

      if (!previouslySelectedTiles.includes(relevantTile.name))
        allSelectedTiles[currentDate].push(relevantTile)

    }

    this.setState({
      allSelectedTiles,
      currentlySelectedTiles: tilesToSelect
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

    const tiles = this.state.allSelectedTiles

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

      Object.keys(tiles).map((ele) => {
        console.log(ele)
        console.log(tiles[ele])
        if (tiles[ele].length > 0) {

          tiles[ele].map((tile) => {
            // if (tile.hasOwnProperty('job_id'))
            console.log(tile)
            const jobReqBody = {
              label: "S2Download " + tile.name,
              command: "not used",
              job_type: "S2Download",
              parameters: {
                options: {
                            tile: tile.name,
                            ac: true,
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
                                                                           tile['name'],
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

    console.log('trying to find aoi index')
    console.log(aoi_name)
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
    }

    console.log(currentTiles)

    console.log('updated the tile dict')

    allTiles[currentDate] = currentTiles

    this.setState({
      tileDict,
      allTiles,
      currentTiles
    })
  }

  removeDuplicates = (array) => {

  }

  handleTileClickedInList = (event, tile) => {

    let selectedTiles = this.state.currentlySelectedTiles

    console.log('tile clicked in list')
    console.log(tile)
    console.log(event.shiftKey)
    console.log(event.ctrlKey)
    if (event.ctrlKey)
      this.setState({
        currentlySelectedTiles: [...selectedTiles, tile]
      })
    else
      this.setState({
        currentlySelectedTiles: [tile]
      })
  }

  removeTileFromSelected = (tileRemoved) => {
    console.log('remove tile was clicked')
    let allTiles = this.state.allTiles


    console.log(tileRemoved)
    let allSelectedTiles = this.state.allSelectedTiles

    console.log(allSelectedTiles)
    // get the tile date
    let dateString = moment(tileRemoved.date).format("YYYYMMDD")

    console.log(dateString)

    allSelectedTiles[dateString] = allSelectedTiles[dateString].filter((ele) => {
      return ele.name !== tileRemoved.name
    })

    allTiles[dateString].map((tile) => {
      if (tile.name === tileRemoved.name) {
        tile.selected = false
      }
      return tile
    })

    const currentTiles = allTiles[dateString]

    console.log(allSelectedTiles)

    let currentlySelectedTiles = this.state.currentlySelectedTiles
    console.log(currentlySelectedTiles)

    currentlySelectedTiles = currentlySelectedTiles.filter((ele) => {
      return ele !== tileRemoved.name
    })

    console.log(currentlySelectedTiles)

    this.setState({
      allSelectedTiles,
      currentlySelectedTiles,
      currentTiles
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
      console.log('hope the job manager updates11111111111111111111111111111111111111111111111')
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

      return (
        <div className="mainContainer" ref="mainContainer">
          <AddAreaOfInterestModal show={this.state.show} hideModal={this.hideModal} addAreaOfInterest={this.addAreaOfInterest} settings={this.props.settings}/>
          <AreaOfInterestList addAreaModal={this.showModal} areasOfInterest={this.state.aoi_list} activateAOI={this.activateAOI}/>
          <div className="centerContainer">
            <MapViewer tiles={this.state.currentTiles} tileSelected={this.handleTileSelect} currentAoiWkt={wkt_footprint} activeAOI={this.state.activeAOI} currentDate={this.state.currentDate}/>
            <FilteringTools selectAll={this.selectAllVisibleTiles} />
            <TimelineViewer currentDate={this.state.currentDate} incrementDate={this.incrementDate} decrementDate={this.decrementDate}/>
          </div>
          <TileList selectedTiles={this.state.allSelectedTiles} currentlySelectedTiles={this.state.currentlySelectedTiles} tileClicked={this.handleTileClickedInList} removeTile={this.removeTileFromSelected} submitAllJobs={this.handleSubmitAllJobs} settings={this.props.settings}/>
        </div>
      );
    }
}