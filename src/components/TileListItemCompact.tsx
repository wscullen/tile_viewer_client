import './../assets/css/TileListItemCompact.scss'

import React, { Component } from 'react'
import { Icon, Button, SemanticCOLORS, SemanticICONS, Label } from 'semantic-ui-react'
import { Job } from '../store/job/types'
import { Tile } from '../store/tile/types'

interface AppProps {
  job: Job
  tile: Tile
  removeTile: Function
  toggleVisibility: Function
  resubmitLastJob: Function
}

export default function TileListItemCompact(props: AppProps) {
  console.log('inside tile list item display')
  console.log(props)

  let jobProgressIcon: SemanticICONS = 'hourglass start'
  let jobProgressColor: SemanticCOLORS = 'grey'
  let downloadButtonClass = 'tileActionButton '
  let retryButtonClass = 'tileActionButton '

  console.log(props.job)
  if (props.job) {
    if (props.job.status === 0) {
      jobProgressColor = 'grey'
    } else if (props.job.status === 1) {
      jobProgressIcon = 'hourglass half'
      jobProgressColor = 'black'
    } else if (props.job.status === 2) {
      jobProgressIcon = 'hourglass end'
    }

    if (props.job.success === true) {
      jobProgressColor = 'green'
    } else if (props.job.success === false && props.job.status === 2) {
      jobProgressColor = 'red'
    }

    if (props.job.status !== 2 && props.job.success !== true) {
      downloadButtonClass += 'disabledIcon'
    }

    if (props.job.success === false) {
      retryButtonClass += 'disabledIcon'
    }
  }

  let toggleVisIcon: SemanticICONS
  let toggleVisColor: SemanticCOLORS

  if (props.tile.visible) {
    toggleVisIcon = 'eye'
    toggleVisColor = 'blue'
  } else {
    toggleVisIcon = 'eye slash'
    toggleVisColor = 'grey'
  }

  let tileNameClass

  let tileNameParts = props.tile.properties.name.split('_')
  let displayName

  if (props.tile.properties.platformName === 'Sentinel-2') {
    displayName = `${tileNameParts[0]}_${tileNameParts[1].slice(3)}_${tileNameParts[5].slice(1)}_${tileNameParts[2]}_${
      tileNameParts[6]
    }`
  } else {
    displayName = props.tile.properties.name
  }

  return (
    <div className="tileListItemCompact">
      <div className="tileListItemLeft">
        <Button.Group>
          <Button
            compact
            basic
            circular
            size="small"
            color={toggleVisColor}
            icon={toggleVisIcon}
            onClick={event => {
              console.log('Toggle Tile visibility')
              console.log(event.target)
              console.log(props.tile)
              event.stopPropagation()
              props.toggleVisibility(props.tile.id)
            }}
          />
        </Button.Group>
        <span className="sectionLabel">{displayName}</span>
      </div>
      <div className="tileListItemActions">
        {props.job ? <Icon name={jobProgressIcon} color={jobProgressColor} circular /> : ''}

        <Button.Group>
          <Button
            basic
            size="mini"
            compact
            icon="redo alternate"
            className={retryButtonClass}
            onClick={event => {
              console.log('re submit a job')
              props.resubmitLastJob(props.tile)
              // props.removeTile(props.tile)
              event.stopPropagation()
            }}
          />
          <Button
            basic
            compact
            size="mini"
            icon="download"
            className={downloadButtonClass}
            onClick={event => {
              console.log('start a zip and download operation')
              // props.removeTile(props.tile)
              event.stopPropagation()
            }}
          />
          <Button
            basic
            compact
            size="mini"
            icon="info"
            onClick={event => {
              console.log('display tile info')
              // props.removeTile(props.tile)
              event.stopPropagation()
            }}
          />
          <Button
            basic
            compact
            size="mini"
            icon="times circle outline"
            color="red"
            onClick={event => {
              console.log('trying to remove tile, inside tile list')
              props.removeTile(props.tile.id)
              event.stopPropagation()
            }}
          />
        </Button.Group>
      </div>
    </div>
  )
}
