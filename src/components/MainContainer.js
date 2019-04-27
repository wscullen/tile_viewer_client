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

import {ipcRenderer} from 'electron'

const defaultState = {
    show: false ,
    aoi_list: [],
    activeAOI: null,
    allSelectedTiles: [],
    currentlySelectedTiles: []
}


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

    this.setState({
      activeAOI: aoi_name,
      currentTiles: sortedTiles.datesObject[currentDate],
      dateList,
      allTiles: sortedTiles.datesObject,
      currentDate: currentDate,
    })
  }

  getAoiObject = (aoi_name) => {
    return this.state.aoi_list.find((ele) => ele.name === aoi_name)
  }

  handleTileSelect = (tiles, selectObject) => {
    console.log('this tile was selected')
    console.log(tiles)
    let selectedTiles = this.state.allSelectedTiles
    for (let tile of tiles) {
      selectedTiles.push(tile)
    }

    let uniqueSelectedTiles = [...new Set(selectedTiles)]

    console.log(uniqueSelectedTiles)
    this.setState({
      allSelectedTiles: uniqueSelectedTiles,
      currentlySelectedTiles: tiles,
      selectObject
    })
  }

  removeDuplicates = (array) => {

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
            <MapViewer tiles={this.state.currentTiles} tileSelected={this.handleTileSelect} currentAoiWkt={wkt_footprint} activeAOI={this.state.activeAOI}/>
            <TimelineViewer currentDate={this.state.currentDate} incrementDate={this.incrementDate} decrementDate={this.decrementDate}/>
          </div>
          <TileList selectedTiles={this.state.allSelectedTiles} currentlySelectedTiles={this.state.currentlySelectedTiles}/>
        </div>
      );
    }
}