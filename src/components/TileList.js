
import './../assets/css/TileList.css'

import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import {SlideDown} from 'react-slidedown'

import moment from 'moment';
import { renderComponent } from 'recompose';


function TileListItemCompact(props) {

  console.log('inside tile list item display')
  console.log(props)


  let jobProgressIcon = ['far', 'hourglass']
  let jobProgressClass = 'tileActionIndicator disabledIcon'

  if (props.tile.job_status === 'submitted') {
    jobProgressIcon = ['fas', 'hourglass-start']
    jobProgressClass = 'tileActionIndicator grey'
  } else if (props.tile.job_status === 'assigned') {
    jobProgressIcon = ['fas', 'hourglass-half']
    jobProgressClass = 'tileActionIndicator '
  } else if (props.tile.job_status === 'completed') {
    jobProgressIcon = ['fas', 'hourglass-end']
    jobProgressClass = 'tileActionIndicator '
  }

  if (props.tile.job_result === 'success')
    jobProgressClass += 'jobSuccess'
  else if (props.tile.job_result === 'failed' && props.tile.job_status === 'completed')
    jobProgressClass += 'jobFailed'

  let downloadButtonClass = 'tileActionButton '
  if (props.tile.job_status !== 'completed' || props.job_result !== 'success')
    downloadButtonClass += 'disabledIcon'

  let retryButtonClass = 'tileActionButton '
  
  if (props.tile.job_result !== 'failed')
      retryButtonClass += 'disabledIcon'

  return (
    <div className='tileListItemCompact'>
      <div className='tileListItemName'>{props.tile.properties.name}</div>
      <div className='tileListItemActions'>
      <button className={retryButtonClass} onClick={(event) => {
        console.log('re submit a job')
        // props.removeTile(props.tile)
        event.stopPropagation()
      }}>
        <FontAwesomeIcon icon="redo-alt"/>
      </button>
      <button className={downloadButtonClass} onClick={(event) => {
        console.log('start a zip and download operation')
        // props.removeTile(props.tile)
        event.stopPropagation()
      }}>
        <FontAwesomeIcon icon="download"/>
      </button>
      <div className={jobProgressClass}>
        <FontAwesomeIcon icon={jobProgressIcon}/>
      </div>
      <button className='tileActionButton infoAction' onClick={(event) => {
        console.log('display tile info')
        // props.removeTile(props.tile)
        event.stopPropagation()
      }}>
        <FontAwesomeIcon icon="info"/>
      </button>
      <button className='tileActionButton removeAction' onClick={(event) => {
        console.log('trying to remove tile, inside tile list')
        props.removeTile(props.tile)
        event.stopPropagation()
      }}>
        <FontAwesomeIcon icon="times-circle"/>
      </button>
      </div>
    </div>
  );
}

const defaultState = {
  optionsHide: true
}

export default class TileList extends Component {
  constructor(props) {
    super(props)
    
    this.state = {
      ...defaultState
    }
  }

  updateSettings = (settingChanged, e) => {
    console.log(settingChanged)
    console.log(e.target.value)
    let updatedSettings = {}
    if (settingChanged === 'atmosphericCorrection')    
      updatedSettings['atmosphericCorrection'] = e.target.checked

    this.props.updateSettings(updatedSettings)
  }

  toggleTileSettings = () => {
    console.log('Showing tile options')
    this.setState({
      optionsHide: !this.state.optionsHide
    })
  }

  render() {
    console.log(this.props.selectedTilesInList)
    console.log(this.props.settings)
    return (
      <div className="tileList">
        <div className="header">
            <h3 className="sectionLabel">Tile List</h3>
            <div className="buttonSection">
              <button className="settingsButton" onClick={this.toggleTileSettings}>
                <FontAwesomeIcon icon="cog"/>
              </button>
              <button className="addAreaButton myButton" onClick={() => this.props.submitAllJobs()}>
                  Start All
              </button>
            </div>
        </div>
        <SlideDown className={'my-dropdown-slidedown'} closed={this.state.optionsHide}>
          {/* {props.open ? props.children : null} */}
          <div className="tileOptionPanel">
            <h4>Job Options</h4>

                <input onChange={(e) => this.updateSettings('atmosphericCorrection', e)} id={this.id} type="checkbox" checked={this.props.settings.atmosphericCorrection} />
                <label htmlFor={this.id}>Atmospheric Correction</label>
          </div>
        </SlideDown>
        <ul>
          {Object.keys(this.props.selectedTiles).map((d) => {
            let listElements = []
            
            if (this.props.selectedTiles[d].length > 0) {
              
              let headerEle = (<li className="dateSection" key={d}>{moment(d).format('MMMM DD YYYY')}</li>)
              listElements.push(headerEle)
              let counter = 0
              for (let tile of this.props.selectedTiles[d]) {
                let clsName = "tileListItem"

                if (this.props.selectedTilesInList.includes(tile.id)) {
                  clsName = "tileListItem activeSelection"
                }
                if (counter % 2 === 0)
                  clsName += " altBackground"

                counter++;

                let tileEle = (<li className={clsName} key={tile.properties.name} name={tile.properties.name} onClick={(event) => this.props.tileClicked(event, tile.id)}><TileListItemCompact tile={tile} removeTile={this.props.removeTile}/></li>)
                listElements.push(tileEle)
              }
             
            }
            return listElements
           
          })}
        </ul>
      </div>
    );
  }

}