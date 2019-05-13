import './../assets/css/AreaOfInterestList.css'

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'



function AreaOfInterestList(props) {
    return (
      <div className="areaOfInterestList">
        <div className="header">
            <h3 className="sectionLabel">Area List</h3>
            <button className="addAreaButton myButton" onClick={props.addAreaModal}>
                <FontAwesomeIcon icon="plus"/>
            </button>
        </div>
        <ul>
          {props.areasOfInterest.map((ele) => {
            return (
              <li className="aoiListItem" key={ele.name} name={ele.name} onClick={() => props.activateAOI(ele.name)}>{ele.name}</li>
            )
          })}
        </ul>
      </div>
    );
  }

export default AreaOfInterestList;