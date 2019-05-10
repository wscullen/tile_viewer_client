import './../assets/css/MainContainer.css'
import './../assets/css/CenterContainer.css'

import React, { Component } from 'react';

import MapViewer from './MapViewer';
import AreaOfInterestList from './AreaOfInterestList';
import TimelineViewer from './TimelineViewer';
import TileList from './TileList';
import AddAreaOfInterestModal from './AddAreaOfInterestModal';

import SimpleStorage, {clearStorage} from "react-simple-storage";

import moment from 'moment';

import base64 from 'base-64'

import {ipcRenderer} from 'electron'

const defaultState = {
    show: false ,
    aoi_list: [],
    activeAOI: null,
    allSelectedTiles: [],
    currentlySelectedTiles: [],
    job_csrf_token: null,
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
        clearStorage()
        console.log('clearing local storage')
        this.resetState()
      }
    });

    this.state = defaultState
  }

  resetState = () => {
    this.setState(defaultState)
  }

  showModal = () => {
    this.setState({ show: true });
  };

  hideModal = () => {
    this.setState({ show: false });
  };

  clearLocalStorage = () => {
    clearStorage()
  }

  incrementDate = () => {
    console.log('increment date button pressed')
    let dateList = this.state.dateList
    let indexOfCurrentDate = dateList.indexOf(this.state.currentDate)
    console.log(dateList)

  
    if (indexOfCurrentDate !== (dateList.length - 1)) {
      let newIndex = indexOfCurrentDate + 1;

      let newDate = dateList[newIndex]
      if (this.state.selectObject){
        this.state.selectObject.getFeatures().clear()
      }


      this.setState({
        currentDate: newDate,
        currentTiles: this.state.allTiles[newDate],
        selectObject: null,
        currentlySelectedTiles: [],
      })

    }
  }

  decrementDate = () => {
    console.log('decrement date pressed')
    let dateList = this.state.dateList
    let indexOfCurrentDate = dateList.indexOf(this.state.currentDate)
    console.log(dateList)

    if (indexOfCurrentDate !== 0) {
      let newIndex = indexOfCurrentDate - 1;
      let newDate = dateList[newIndex]
      if (this.state.selectObject){
        this.state.selectObject.getFeatures().clear()
      }

      this.setState({
        currentDate: newDate,
        currentTiles: this.state.allTiles[newDate],
        selectObject: null,
        currentlySelectedTiles: [],
      })
    }

  }

  addAreaOfInterest = (area) => {
    console.log('Trying to add area of interest')
    console.log(area)

    this.setState({
      aoi_list: [...this.state.aoi_list, area]
    })
  }

  activateAOI = (aoi_name) => {
    // When an AOI is clicked in the list, it is made active and passed to the map viewer
   
    console.log('YOU CLICKED AN AREA OF INTEREST')
    console.log(aoi_name)
    
    const activeAOI = this.getAoiObject(aoi_name)
    
    console.log(activeAOI)

    console.log('Sorting tiles by date...')
    let sortedTiles = this.sortTilesByDate(activeAOI.raw_tile_list)

    console.log(sortedTiles)

    // Since the AOI is newly activated, lets put the current date to the first date.

    let dateList = Object.keys(sortedTiles.datesObject)
    console.log(dateList)
    let currentDate = dateList[0]

    let allSelectedTiles = {}

    for (let datestring of dateList) {
      allSelectedTiles[datestring] = []
    } 

    this.setState({
      activeAOI: aoi_name,
      currentTiles: sortedTiles.datesObject[currentDate],
      dateList,
      allTiles: sortedTiles.datesObject,
      currentDate: currentDate,
      allSelectedTiles
    })
  }

  getCSRFToken = (callback, api) => {
    let headers = new Headers();

    if (api === 'job_manager')
      server_url = JOB_MANAGER_SERVER_URL

      fetch(`${server_url}/generate_csrf/`, {
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

        setTimeout(() => callback(), 200)
      })
      .catch((err) =>
        console.log('something blew up')
      );
  }

  checkJobStatus = (job_id) => {
    if (this.state.job_csrf_token === null) {
      
      getCSRFToken(checkJobStatus, 'job_manager')

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
          
            fetch(`${JOB_MANAGER_SERVER_URL}/jobs/`, {
              method: 'POST',
              body: JSON.stringify(jobReqBody),
              headers: headers,
            })
            .then(response => response.json())
            .then(response => {
              console.log('Success:', JSON.stringify(response))
    
              const data = response['data']
              console.log(data)
              console.log('wat')

              // Success: {"url":"http://localhost:9090/jobs/7b34635e-7d4b-45fc-840a-8c9de3251abc/","id":"7b34635e-7d4b-45fc-840a-8c9de3251abc","submitted":"2019-05-09T21:49:36.023959Z","label":"S2Download L1C_T12UUA_A015468_20180608T183731","command":"not used","job_type":"S2Download","parameters":{"options":{"tile":"L1C_T12UUA_A015468_20180608T183731","ac":true,"ac_res":10}},"priority":"3","owner":"backup"}
              // Todo update each tile with job info (id, status, success, workerid)
              // console.log(tile)
              // tile['job_id'] = data["id"]
              // tile["job_submitted"] = data["submitted"]
              // tile['job_success'] = null
              // tile['job_progress'] = 'submitted'
              // console.log(tile)


            }).catch((err) => {
              console.log(err)
              console.log('something went wrong when trying to submit the job')
            })
        
          })
        }
      })
    }









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

      fetch(`${JOB_MANAGER_SERVER_URL}/generate_csrf/`, {
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
          
            fetch(`${JOB_MANAGER_SERVER_URL}/jobs/`, {
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

  // const oneTile = {
  //   "label": "S2"
  // }

  // fetch(`{JOB_MANAGER_SERVER_URL}/jobs/`, {
  //   method: 'POST',
  //   body: formData,
  //   headers: headers,
  // })
  // .then(response => response.json())
  // .then(response => {
  //   console.log('Success:', JSON.stringify(response))

  //   const data = response['data']
  //   console.log(this.state.files)

  //   const aoi = {
  //     name: this.state.name,
  //     startDate: this.state.startDate,
  //     endDate: this.state.endDate,
  //     shapefile: this.state.files.filter((ele) => path.extname(ele.name) === '.shp'),
  //     wkt_footprint: data['wkt_footprint'],
  //        mgrs_list: data['mgrs_list'],
  //        wrs_list: data['wrs_list'],
  //        raw_tile_list: data['tile_results']
  //   }
  //   this.props.addAreaOfInterest(aoi);
  //   console.log(aoi)

  //   this.form.current.reset();


  }

  getAoiObject = (aoi_name) => {
    return this.state.aoi_list.find((ele) => ele.name === aoi_name)
  }

  handleTileSelect = (tiles, selectObject) => {
    
    console.log('this tile was selected')
    console.log(tiles)

    // find the relevant tile info first (to find the date)
    let allSelectedTiles = this.state.allSelectedTiles
    let allTiles = this.state.allTiles
    let currentDate = this.state.currentDate
    for (let t of tiles) {
      let relevantTile = allTiles[currentDate].find((ele) => ele.name == t)
      console.log(relevantTile)
      
      let previouslySelectedTiles = allSelectedTiles[currentDate].map((tile) => tile.name)
      console.log(previouslySelectedTiles)
      console.log(relevantTile.name)
      if (!previouslySelectedTiles.includes(relevantTile.name))
        allSelectedTiles[currentDate].push(relevantTile)
    
    }

    this.setState({
      allSelectedTiles,
      currentlySelectedTiles: tiles,
      selectObject
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
    console.log(tileRemoved)
    let allSelectedTiles = this.state.allSelectedTiles

    console.log(allSelectedTiles)
    // get the tile date
    let dateString = tileRemoved.date.format("YYYYMMDD")

    console.log(dateString)

    allSelectedTiles[dateString] = allSelectedTiles[dateString].filter((ele) => {
      return ele.name !== tileRemoved.name
    })

    console.log(allSelectedTiles)

    let currentlySelectedTiles = this.state.currentlySelectedTiles
    console.log(currentlySelectedTiles)

    currentlySelectedTiles = currentlySelectedTiles.filter((ele) => {
      return ele !== tileRemoved.name
    })

    console.log(currentlySelectedTiles)

    this.setState({
      allSelectedTiles,
      currentlySelectedTiles
    })
  }

  sortTilesByDate = (tiles) => {
    if (tiles) {
      let formatted_tiles = [];
      for (let raw_tile of tiles) {

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
          date: mid_date
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

    componentDidMount() {
      
    }

    componentDidUpdate(prevProps, prevState) {
      
    }

    render () {

      let wkt_footprint = null;
      // get AOI wkt from the currently active AOI
      console.log(this.state)
      console.log('simple storage still saving shit')
      
      if (this.state.activeAOI) {
        const aoi_object = this.getAoiObject(this.state.activeAOI)
        console.log(aoi_object)
        wkt_footprint = aoi_object.wkt_footprint
      }

      return (
        <div className="mainContainer" ref="mainContainer">
          <SimpleStorage parent={this} blacklist={['activeAOI', 'allSelectedTiles', 'currentlySelectedTiles']}/>
          <AddAreaOfInterestModal show={this.state.show} hideModal={this.hideModal} addAreaOfInterest={this.addAreaOfInterest} />
          <AreaOfInterestList addAreaModal={this.showModal} areasOfInterest={this.state.aoi_list} activateAOI={this.activateAOI}/>
          <div className="centerContainer">
            <MapViewer tiles={this.state.currentTiles} tileSelected={this.handleTileSelect} currentlySelectedTiles={this.state.currentlySelectedTiles} currentAoiWkt={wkt_footprint} activeAOI={this.state.activeAOI}/>
            <TimelineViewer currentDate={this.state.currentDate} incrementDate={this.incrementDate} decrementDate={this.decrementDate}/>
          </div>
          <TileList selectedTiles={this.state.allSelectedTiles} currentlySelectedTiles={this.state.currentlySelectedTiles} tileClicked={this.handleTileClickedInList} removeTile={this.removeTileFromSelected} submitAllJobs={this.handleSubmitAllJobs}/>
        </div>
      );
    }
}