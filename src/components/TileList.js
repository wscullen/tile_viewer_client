
import './../assets/css/TileList.css'

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import moment from 'moment';


function TileListItemCompact(props) {
  return (
    <div className='tileListItemCompact'>
      <div className='tileListItemName'>{props.tile.name}</div>
      <div className='tileListItemActions'>
      <button className='tileActionButton' onClick={(event) => {
        console.log('trying to remove tile')
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
            <button className="addAreaButton myButton" onClick={() => console.log('Submitting jobs')}>
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

                let tileEle = (<li className={clsName} key={tile.name} name={tile.name} onClick={(event) => props.tileClicked(event, tile.name)}><TileListItemCompact tile={tile} /></li>)
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