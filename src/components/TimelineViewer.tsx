import './../assets/css/TimelineViewer.scss'

import React from 'react'
import moment from 'moment'

import { Dropdown, Button, Icon } from 'semantic-ui-react'

interface AppProps {
  currentDate: string
  dateList: string[]
  currentPlatform: string
  allPlatforms: string[]
  handlePlatformChange: Function
  incrementDate: Function
  decrementDate: Function
}

const createDropdownOption = (platform: any) => {
  let platformName
  if (platform === 'landsat8') {
    platformName = 'Landsat 8'
  } else if (platform === 'sentinel2') {
    platformName = 'Sentinel 2'
  }

  const option = {
    key: platform,
    text: platformName,
    value: platform,
  }

  return option
}

function TimelineViewer(props: AppProps) {
  const decrementDisabled = props.currentDate === props.dateList[0]
  const incrementDisabled = props.currentDate === props.dateList[props.dateList.length - 1]

  const platformDropdownOptions: any[] = []

  props.allPlatforms.map(platform => {
    platformDropdownOptions.push(createDropdownOption(platform))
  })

  return (
    <div className="timelineViewer">
      <div className="header">
        <div className="titleSection">
          <h5 className="sectionLabel title is-5">Timeline Viewer</h5>
        </div>
        <div className="controlsSection">
          <div className="platformSelectSection">
            <h5 className="sectionLabel title is-5">Platform:</h5>
            <Dropdown
              placeholder="Select Platform"
              fluid
              compact
              selection
              onChange={(e, { value }) => props.handlePlatformChange(e, value)}
              options={platformDropdownOptions}
              value={props.currentPlatform}
            />
          </div>
          <div className="dateSelectSection">
            <h5 className="sectionLabel title is-5">
              {props.currentDate === '' ? '' : moment(props.currentDate, 'YYYYMMDD').format('MMMM D, YYYY')}
            </h5>
            <div className="buttonSection">
              <Button.Group>
                <Button icon compact primary onClick={() => props.decrementDate()} disabled={decrementDisabled}>
                  <Icon name="arrow left" />
                </Button>
                <Button icon compact primary onClick={() => props.incrementDate()} disabled={incrementDisabled}>
                  <Icon name="arrow right" />
                </Button>
              </Button.Group>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TimelineViewer
