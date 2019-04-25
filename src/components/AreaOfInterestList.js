import './../assets/css/AreaOfInterestList.css'

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'



function AreaOfInterestList(props) {
    return (
      <div className="areaOfInterestList">
        <div className="header">
            <h3 className="sectionLabel">Areas List</h3>
            <button className="addAreaButton myButton" onClick={props.addAreaModal}>
                <FontAwesomeIcon icon="plus"/>
            </button>
        </div>
      </div>
    );
  }

export default AreaOfInterestList;