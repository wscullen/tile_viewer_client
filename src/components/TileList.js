
import './../assets/css/TileList.css'

import React from 'react';

function TileList(props) {
    return (
      <div className="tileList">
        <div className="header">
            <h3 className="sectionLabel">Selected Tile List</h3>
        </div>
        <ul>
          {props.selectedTiles.map((ele) => {
            let clsName = "tileListItem"
            if (props.currentlySelectedTiles.includes(ele)) {
              clsName = "tileListItem activeSelection"
            }
            return (
              <li className={clsName} key={ele} name={ele} onClick={() => console.log('tile list item clicked')}>{ele}</li>
            )
          })}
        </ul>
      </div>
    );
  }

export default TileList;