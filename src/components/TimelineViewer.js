import './../assets/css/TimelineViewer.css'

import React from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'


function TimelineViewer(props) {
    console.log(props.allTiles)
    const dateList = Object.keys(props.allTiles)
    const decrementDisabled = props.currentDate === dateList[0]
    const incrementDisabled = props.currentDate === dateList[dateList.length - 1]
  

    return (
      <div className="timelineViewer">
        <h3>Timeline Viewer</h3>
        <p>{props.currentDate}</p>
        <div className="controls">
          <button className="decrementDate button" onClick={props.decrementDate} disabled={decrementDisabled}>
                  <FontAwesomeIcon icon="arrow-left"/>
              </button>
              <button className="incrementDate button" onClick={props.incrementDate} disabled={incrementDisabled}>
                  <FontAwesomeIcon icon="arrow-right"/>
              </button>
          </div>
      </div>
    );
  }

export default TimelineViewer;