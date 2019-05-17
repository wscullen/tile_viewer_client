import './../assets/css/FilteringTools.css';

import React from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const FilteringTools = ({ selectAll, deselectAll, updateCloudFilter }) => {
      
    return (
      <div className="filteringTools">
        <div className="controlGroup">
          <button className="selectAllButton" onClick={selectAll}>Select All</button>
          <button className="deselectAllButton" onClick={deselectAll}>De-Select All</button>
          </div>
          <div className="controlGroup">
          <input type="range" id="start" name="cloudiness" min="0" max="100" onChange={() => console.log('cloudiness slider changed')}/>
          
          <label htmlFor="cloudiness">Filter by Cloud %</label>
          </div>
      </div>
    );
  };

export default FilteringTools;