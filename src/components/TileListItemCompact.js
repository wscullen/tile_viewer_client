
import './../assets/css/TileListItemCompact.css'

import React, { Component } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export default function TileListItemCompact (props) {
  console.log('inside tile list item display')
  console.log(props)

  let jobProgressIcon = ['far', 'hourglass']
  let jobProgressClass = 'tileActionIndicator disabledIcon'

  if (props.tile.job_status === 'submitted') {
    jobProgressIcon = ['fas', 'hourglass-start']
    jobProgressClass = 'tileActionIndicator grey'
  } else if (props.tile.job_status === 'assigned') {
    jobProgressIcon = ['fas', 'hourglass-half']
    jobProgressClass = 'tileActionIndicator '
  } else if (props.tile.job_status === 'completed') {
    jobProgressIcon = ['fas', 'hourglass-end']
    jobProgressClass = 'tileActionIndicator '
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

  if (props.tile.job_result === 'success') { jobProgressClass += 'jobSuccess' } else if (props.tile.job_result === 'failed' && props.tile.job_status === 'completed') { jobProgressClass += 'jobFailed' }

  let downloadButtonClass = 'tileActionButton '
  if (props.tile.job_status !== 'completed' || props.job_result !== 'success') { downloadButtonClass += 'disabledIcon' }

  let retryButtonClass = 'tileActionButton '

  if (props.tile.job_result !== 'failed') { retryButtonClass += 'disabledIcon' }

  return (
    <div className='tileListItemCompact'>
      <div className='tileListItemLeft'>
        <button className={toggleVisClass} onClick={(event) => {
          console.log('Toggle Tile visibility')
          console.log(event.target)
          console.log(props.tile)
          event.stopPropagation()
          props.toggleVisibility(props.tile.id)
        }}>
          <FontAwesomeIcon icon={toggleVisIcon} />
        </button>
        <div className='tileListItemName'>{props.tile.properties.name}</div>
      </div>
      <div className='tileListItemActions'>
        <button className={retryButtonClass} onClick={(event) => {
          console.log('re submit a job')
          // props.removeTile(props.tile)
          event.stopPropagation()
        }}>
          <FontAwesomeIcon icon='redo-alt' />
        </button>
        <button className={downloadButtonClass} onClick={(event) => {
          console.log('start a zip and download operation')
          // props.removeTile(props.tile)
          event.stopPropagation()
        }}>
          <FontAwesomeIcon icon='download' />
        </button>
        <div className={jobProgressClass}>
          <FontAwesomeIcon icon={jobProgressIcon} />
        </div>
        <button className='tileActionButton infoAction' onClick={(event) => {
          console.log('display tile info')
          // props.removeTile(props.tile)
          event.stopPropagation()
        }}>
          <FontAwesomeIcon icon='info' />
        </button>
        <button className='tileActionButton removeAction' onClick={(event) => {
          console.log('trying to remove tile, inside tile list')
          props.removeTile(props.tile.id)
          event.stopPropagation()
        }}>
          <FontAwesomeIcon icon='times-circle' />
        </button>
      </div>
    </div>
  )
}
