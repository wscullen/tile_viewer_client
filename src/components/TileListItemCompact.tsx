import './../assets/css/TileListItemCompact.scss'

import React, { Component } from 'react'
import { Icon, Button, SemanticCOLORS, SemanticICONS, Label, Progress, Segment, Dropdown, ButtonGroup, Popup, Divider } from 'semantic-ui-react'
import { Job, JobStatus, TaskStatus, JobInfoObject } from '../store/job/types'
import { Tile } from '../store/tile/types'
import { tileReducer } from '../store/tile/reducers'

interface AppProps {
  taskStatus: JobInfoObject
  tile: Tile
  removeTile: Function
  toggleVisibility: Function
  resubmitLastJob: Function
  handleTileClicked: Function
  cssClass: String
}

export default function TileListItemCompact(props: AppProps) {
  console.log('inside tile list item display')
  console.log(props)

  let jobProgressIcon: SemanticICONS = 'hourglass start'
  let jobProgressColor: SemanticCOLORS = 'grey'
  let downloadButtonClass = 'tileActionButton '
  let retryButtonClass = 'tileActionButton '
  
  let progressBarNode = undefined

  if (props.taskStatus && props.taskStatus.status === TaskStatus.Started) {
    let taskProgress = props.taskStatus.progress

    if (taskProgress.hasOwnProperty('upload')) {
      progressBarNode = (<Progress percent={50 + Math.round(taskProgress['upload'] / 2)} color="green" attached="bottom" active />)
    } else if (taskProgress.hasOwnProperty('download')) {
      progressBarNode = (<Progress percent={Math.round(taskProgress['download'] / 2)} color="green" attached="bottom" active />)
    }
  }

  console.log(props.taskStatus)
  if (props.taskStatus) {
    if (props.taskStatus.status === TaskStatus.Pending) {
      jobProgressColor = 'grey'
    } else if (props.taskStatus.status === TaskStatus.Started) {
      jobProgressIcon = 'hourglass half'
      jobProgressColor = 'black'
    } else if (props.taskStatus.status === TaskStatus.Success || props.taskStatus.status === TaskStatus.Failure) {
      jobProgressIcon = 'hourglass end'
    }

    if (props.taskStatus.status === TaskStatus.Success) {
      jobProgressColor = 'green'
    } else if (props.taskStatus.status === TaskStatus.Failure) {
      jobProgressColor = 'red'
    }

    if (props.taskStatus.status === TaskStatus.Failure) {
      downloadButtonClass += 'disabledIcon'
    }

    if (props.taskStatus.status !== TaskStatus.Failure) {
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

  const trigger = (
      <Button 
     
      icon='caret down'/>
  )
  
  const options = [
    {
      key: 'overflow actions',
      text: (
        
       '' 
      ),
    },
  ]

  return (
    <Segment
      vertical
      className={`tileListItemCompact ${props.cssClass}`}
      key={props.tile.properties.name}
      onClick={(event: any) => props.handleTileClicked(event, props.tile.id)}>
      {progressBarNode}
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
        {props.taskStatus ? <Icon name={jobProgressIcon} color={jobProgressColor} size="small" bordered/> : ''}

        <Button.Group basic compact size="tiny">
        <Popup hoverable basic flowing
          position="bottom center"
        
              on="click"
        content={<Segment onClick={(e:any) => e.stopPropagation()} className="tileInfo">

          {props.tile.properties.entityId}

      
        <Button.Group vertical basic size="tiny" className="tileActions">
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
        </Button.Group>
        </Segment>} trigger={ <Button
                basic 
                compact
                icon='caret down'
                size="mini"
                color="grey"
                onClick={event => event.stopPropagation()}/>} 
                mouseLeaveDelay={750}
      />
          <Button
            basic
            compact
            className="deselectTileButton"
            icon="times circle"
            size="mini"
            color="red"
            onClick={event => {
              console.log('trying to remove tile, inside tile list')
              props.removeTile(props.tile.id)
              event.stopPropagation()
            }}
          />
        </Button.Group>
      </div>
    </Segment>
  )
}
