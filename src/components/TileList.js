
import './../assets/css/TileList.css'

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import moment from 'moment';


function TileListItemCompact(props) {

  console.log('inside tile list item display')
  console.log(props)


  let jobProgressIcon = ['far', 'hourglass']
  let jobProgressClass = 'tileActionIndicator disabledIcon'

  if (props.tile.job_status === 'submitted') {
    jobProgressIcon = ['fas', 'hourglass-start']
    jobProgressClass = 'tileActionIndicator '
  } else if (props.tile.job_status === 'assigned') {
    jobProgressIcon = ['fas', 'hourglass-half']
    jobProgressClass = 'tileActionIndicator '
  } else if (props.tile.job_status === 'completed') {
    jobProgressIcon = ['fas', 'hourglass-end']
    jobProgressClass = 'tileActionIndicator '
  }

  if (props.tile.job_result === 'success')
    jobProgressClass += 'jobSuccess'
  else if (props.tile.job_result === 'failed')
    jobProgressClass += 'jobFailed'

  let downloadButtonClass = 'tileActionButton '
  if (props.tile.job_status !== 'completed' || props.job_result !== 'success')
    downloadButtonClass += 'disabledIcon'

  let retryButtonClass = 'tileActionButton '
  if (props.tile.job_result !== 'failed')
      retryButtonClass += 'disabledIcon'

  return (
    <div className='tileListItemCompact'>
      <div className='tileListItemName'>{props.tile.name}</div>
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
      <button className='tileActionButton' onClick={(event) => {
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


function TileList(props) {
    console.log(props.currentlySelectedTiles)
    return (
      <div className="tileList">
        <div className="header">
            <h3 className="sectionLabel">Tile List</h3>
            <button className="addAreaButton myButton" onClick={() => props.submitAllJobs()}>
                Start All
            </button>
        </div>
        <ul>
          {Object.keys(props.selectedTiles).map((d) => {
            let listElements = []
            
            if (props.selectedTiles[d].length > 0) {
              
              let headerEle = (<li className="dateSection" key={d}>{moment(d).format('MMMM DD YYYY')}</li>)
              listElements.push(headerEle)
              let counter = 0
              for (let tile of props.selectedTiles[d]) {
                let clsName = "tileListItem"

                if (props.currentlySelectedTiles.includes(tile.name)) {
                  clsName = "tileListItem activeSelection"
                }
                if (counter % 2 === 0)
                  clsName += " altBackground"

                counter++;

                let tileEle = (<li className={clsName} key={tile.name} name={tile.name} onClick={(event) => props.tileClicked(event, tile.name)}><TileListItemCompact tile={tile} removeTile={props.removeTile}/></li>)
                listElements.push(tileEle)
              }
             
            }
            return listElements
           
          })}
        </ul>
      </div>
    );
  }

export default TileList;