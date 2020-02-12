import './../assets/css/FilteringTools.scss'

import React, { Component } from 'react'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { Slider, Rail, Handles, Tracks, Ticks, SliderItem, GetHandleProps, GetTrackProps } from 'react-compound-slider'

import { Button, Icon, Label } from 'semantic-ui-react'

import CustomSlider from './Slider'

const sliderStyle = {
  position: 'relative' as 'relative',
  top: '10px',
  width: '90%',
  height: '40px',
  margin: '0px 10px',
}

const railStyle = {
  position: 'absolute' as 'absolute',
  borderRadius: '4px',
  backgroundColor: 'rgba(0, 0, 0, 0.05)',
  width: '100%',
  height: '0.4em',
  top: '0.55em',
  left: 0,
  zIndex: 1,
}

interface IHandleProps {
  domain: number[]
  handle: SliderItem
  getHandleProps: GetHandleProps
}

const Handle = ({ domain: [min, max], handle: { id, value, percent }, getHandleProps }: IHandleProps) => (
  <div
    role="slider"
    aria-valuemin={min}
    aria-valuemax={max}
    aria-valuenow={value}
    style={{
      position: 'absolute',
      left: `${percent}%`,
      height: '1.5em',
      width: '1.5em',
      background: '#ffffff linear-gradient(transparent, rgba(0, 0, 0, 0.05))',
      borderRadius: '100%',
      boxShadow: '0 1px 2px 0 rgba(34, 36, 38, 0.15), 0 0 0 1px rgba(34, 36, 38, 0.15) inset',
      margin: '0px',
      zIndex: 2,
      transform: 'translate(-50%, 0%)',
    }}
    {...getHandleProps(id)}
  />
)

interface ITrackProps {
  source: SliderItem
  target: SliderItem
  getTrackProps: GetTrackProps
}

const Track = ({ source, target, getTrackProps }: ITrackProps) => (
  <div
    style={{
      position: 'absolute',
      borderRadius: '4px',
      backgroundColor: '#1B1C1D',

      height: '0.4em',
      top: '0.55em',
      zIndex: 1,
      left: `${source.percent}%`,
      width: `${target.percent - source.percent}%`,
    }}
    {...getTrackProps()}
  />
)

interface ITickProps {
  key: string
  tick: SliderItem
  count: number
  format: Function
}

const Tick = ({ tick, count, format }: ITickProps) => (
  <div>
    <div
      style={{
        position: 'absolute',
        marginTop: 14,
        width: 1,
        height: 5,
        backgroundColor: 'rgb(200,200,200)',
        left: `${tick.percent}%`,
      }}
    />
    <div
      style={{
        position: 'absolute',
        marginTop: 16,
        fontSize: 10,
        textAlign: 'center',
        marginLeft: `${-(100 / count) / 2}%`,
        width: `${100 / count}%`,
        left: `${tick.percent}%`,
      }}
    >
      {format(tick.value)}
    </div>
  </div>
)

const domain = [0, 100]
const formatTicks = (d: any) => {
  return `${d}`
}

interface AppProps {
  cloudPercentFilter: number
  selectAll: Function
  deselectAll: Function
  updateCloudFilter: Function
}

interface AppState {
  cloudPercentFilter: number
}

export default class FilteringTools extends Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props)
    const { cloudPercentFilter } = props

    this.state = {
      cloudPercentFilter,
    }
  }

  componentDidMount() {}

  componentDidUpdate() {}

  render() {
    return (
      <div className="filteringTools">
        <div className="controlGroup">
          <Button onClick={e => this.props.selectAll()} compact>
            Select All Visible
          </Button>
          <Button onClick={e => this.props.deselectAll()} compact>
            De-Select All For Current Date
          </Button>
        </div>
        <div className="controlGroup2">
          <Slider
            mode={1}
            step={1}
            domain={domain}
            rootStyle={sliderStyle}
            onChange={values => this.props.updateCloudFilter(values[0])}
            onUpdate={values => {
              setTimeout(this.props.updateCloudFilter(values[0]), 650)
            }}
            values={[this.props.cloudPercentFilter]}
          >
            <Rail>{({ getRailProps }) => <div style={railStyle} {...getRailProps()} />}</Rail>
            <Handles>
              {({ handles, getHandleProps }) => (
                <div className="slider-handles">
                  {handles.map(handle => (
                    <Handle key={handle.id} handle={handle} domain={domain} getHandleProps={getHandleProps} />
                  ))}
                </div>
              )}
            </Handles>
            <Tracks right={false}>
              {({ tracks, getTrackProps }) => (
                <div className="slider-tracks">
                  {tracks.map(({ id, source, target }) => (
                    <Track key={id} source={source} target={target} getTrackProps={getTrackProps} />
                  ))}
                </div>
              )}
            </Tracks>
            <Ticks values={[0, 25, 50, 75, 100]}>
              {({ ticks }) => (
                <div className="slider-ticks">
                  {ticks.map(tick => (
                    <Tick key={tick.id} format={formatTicks} tick={tick} count={ticks.length} />
                  ))}
                </div>
              )}
            </Ticks>
          </Slider>
          <Label size="medium" basic pointing={'left'}>
            {`${this.props.cloudPercentFilter}%`}
            <br /> Cloud
          </Label>
        </div>
      </div>
    )
  }
}
