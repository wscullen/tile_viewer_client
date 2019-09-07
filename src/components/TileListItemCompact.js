import './../assets/css/TileListItemCompact.css'

import React, { Component } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export default function TileListItemCompact(props) {
  console.log('inside tile list item display')
  console.log(props)

  let jobProgressIcon = ['far', 'hourglass']
  let jobProgressClass = 'tileActionIndicator disabledIcon'
  let downloadButtonClass = 'tileActionButton '
  let retryButtonClass = 'tileActionButton '

  console.log(props.job)
  if (props.job) {
    if (props.job.status === 0) {
      jobProgressIcon = ['fas', 'hourglass-start']
      jobProgressClass = 'tileActionIndicator grey'
    } else if (props.job.status === 1) {
      jobProgressIcon = ['fas', 'hourglass-half']
      jobProgressClass = 'tileActionIndicator '
    } else if (props.job.status === 2) {
      jobProgressIcon = ['fas', 'hourglass-end']
      jobProgressClass = 'tileActionIndicator '
    }

    if (props.job.success === true) {
      jobProgressClass += 'jobSuccess'
    } else if (props.job.success === false && props.job.status === 2) {
      jobProgressClass += 'jobFailed'
    }

    if (props.job.status !== 2 && props.job.result !== true) {
      downloadButtonClass += 'disabledIcon'
    }

    if (props.job.success === false) {
      retryButtonClass += 'disabledIcon'
    }
  }

  let toggleVisIcon = ['fas', 'eye']
  let toggleVisClass = 'tileActionButton visibleIcon'

  if (props.tile.visible) {
    toggleVisIcon = ['fas', 'eye']
    toggleVisClass = 'tileActionButton visibleIcon'
  } else {
    toggleVisIcon = ['fas', 'eye-slash']
    toggleVisClass = 'tileActionButton nonvisibleIcon'
  }

  let tileNameClass

  let tileNameParts = props.tile.properties.name.split('_')
  let displayName

  if (props.tile.properties.platformName === 'Sentinel-2') {
    displayName = `${tileNameParts[0]}_${tileNameParts[1].slice(3)}_${tileNameParts[2]}_${
      tileNameParts[6]
    }_${tileNameParts[5].slice(1)}`
  } else {
    displayName = props.tile.properties.name
  }

  return (
    <div className="tileListItemCompact">
      <div className="tileListItemLeft">
        <button
          className={toggleVisClass}
          onClick={event => {
            console.log('Toggle Tile visibility')
            console.log(event.target)
            console.log(props.tile)
            event.stopPropagation()
            props.toggleVisibility(props.tile.id)
          }}
        >
          <FontAwesomeIcon icon={toggleVisIcon} />
        </button>
        <div className={tileNameClass}>{displayName}</div>
      </div>
      <div className="tileListItemActions">
        <button
          className={retryButtonClass}
          onClick={event => {
            console.log('re submit a job')
            props.resubmitLastJob(props.tile)
            // props.removeTile(props.tile)
            event.stopPropagation()
          }}
        >
          <FontAwesomeIcon icon="redo-alt" />
        </button>
        <button
          className={downloadButtonClass}
          onClick={event => {
            console.log('start a zip and download operation')
            // props.removeTile(props.tile)
            event.stopPropagation()
          }}
        >
          <FontAwesomeIcon icon="download" />
        </button>
        <div className={jobProgressClass}>
          <FontAwesomeIcon icon={jobProgressIcon} />
        </div>
        <button
          className="tileActionButton infoAction"
          onClick={event => {
            console.log('display tile info')
            // props.removeTile(props.tile)
            event.stopPropagation()
          }}
        >
          <FontAwesomeIcon icon="info" />
        </button>
        <button
          className="tileActionButton removeAction"
          onClick={event => {
            console.log('trying to remove tile, inside tile list')
            props.removeTile(props.tile.id)
            event.stopPropagation()
          }}
        >
          <FontAwesomeIcon icon="times-circle" />
        </button>
      </div>
    </div>
  )
}
