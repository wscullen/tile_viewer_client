import './../assets/css/TimelineViewer.css'

import React from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'


function TimelineViewer(props) {
    return (
      <div className="timelineViewer">
        <h3>Timeline Viewer</h3>
        <p>{props.currentDate}</p>
        <div className="controls">
          <button className="decrementDate button" onClick={props.decrementDate}>
                  <FontAwesomeIcon icon="arrow-left"/>
              </button>
              <button className="incrementDate button" onClick={props.incrementDate}>
                  <FontAwesomeIcon icon="arrow-right"/>
              </button>
          </div>
      </div>
    );
  }

export default TimelineViewer;