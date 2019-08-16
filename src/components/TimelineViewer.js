import './../assets/css/TimelineViewer.css'

import React from 'react'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import moment from 'moment'

function TimelineViewer(props) {
  const decrementDisabled = props.currentDate === props.dateList[0]
  const incrementDisabled = props.currentDate === props.dateList[props.dateList.length - 1]

  return (
    <div className="timelineViewer">
      <div className="header">
        <div className="titleSection">
          <h5 className="sectionLabel title is-5">Timeline Viewer</h5>
        </div>
        <div className="controlsSection">
          <div className="platformSelectSection">
            <h5 className="sectionLabel title is-5">Platform:</h5>
            <select className="platformSelect" value={props.currentPlatform} onChange={props.handlePlatformChange}>
              {props.allPlatforms.map(platform => {
                let platformName
                if (platform === 'landsat8') {
                  platformName = 'Landsat 8'
                } else if (platform === 'sentinel2') {
                  platformName = 'Sentinel 2'
                }

                return (
                  <option key={platform} value={platform}>
                    {platformName}
                  </option>
                )
              })}
            </select>
          </div>
          <div className="dateSelectSection">
            <h5 className="sectionLabel title is-5">{props.currentDate === "" ? "" : moment(props.currentDate, 'YYYYMMDD').format('MMMM D, YYYY')}</h5>
            <div className="buttonSection">
              <div className="controls">
                <button
                  className="decrementDate button"
                  onClick={() => props.decrementDate()}
                  disabled={decrementDisabled}
                >
                  <FontAwesomeIcon icon="arrow-left" />
                </button>
                <button
                  className="incrementDate button"
                  onClick={() => props.incrementDate()}
                  disabled={incrementDisabled}
                >
                  <FontAwesomeIcon icon="arrow-right" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TimelineViewer
