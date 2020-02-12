import './../assets/css/FilteringTools.scss'

import React, { Component, CSSProperties } from 'react'

import {
  Slider as CompoundSlider,
  Rail,
  Handles,
  Tracks,
  Ticks,
  SliderItem,
  GetHandleProps,
  GetTrackProps,
} from 'react-compound-slider'

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
  cursor: 'pointer',
}

interface IHandleProps {
  domain: number[]
  handle: SliderItem
  getHandleProps: GetHandleProps
}

export const Handle = ({ domain: [min, max], handle: { id, value, percent }, getHandleProps }: IHandleProps) => (
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
      cursor: 'pointer',
    }}
    {...getHandleProps(id)}
  />
)

interface ITrackProps {
  source: SliderItem
  target: SliderItem
  getTrackProps: GetTrackProps
}

export const Track = ({ source, target, getTrackProps }: ITrackProps) => (
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
      cursor: 'pointer',
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

export const Tick = ({ tick, count, format }: ITickProps) => (
  <div>
    <div
      style={{
        position: 'absolute',
        marginTop: 20,
        width: 1,
        height: 5,
        backgroundColor: 'rgb(200,200,200)',
        left: `${tick.percent}%`,
      }}
    />
    <div
      style={{
        position: 'absolute',
        marginTop: 25,
        fontSize: 12,
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

const formatTicks = (d: any) => {
  return `${d}`
}

interface AppProps {
  initialValue: number
  mode: number
  step: number
  domain: number[]
  rootStyle: CSSProperties
  onChange: Function
  onUpdate?: Function
  values: number[]
  tickValues: number[]
}

interface AppState {
  sliderValue: number
}

export default class Slider extends Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props)
    const { initialValue } = props

    this.state = {
      sliderValue: initialValue,
    }
  }

  componentDidMount() {}

  componentDidUpdate() {}

  render() {
    return (
      <CompoundSlider
        mode={1}
        step={1}
        domain={this.props.domain}
        rootStyle={this.props.rootStyle}
        onChange={values => this.props.onChange(values[0])}
        onUpdate={values => {
          if (this.props.onUpdate) {
            setTimeout(this.props.onUpdate(values[0]), 500)
          }
        }}
        values={[this.props.initialValue]}
      >
        <Rail>{({ getRailProps }) => <div style={railStyle} {...getRailProps()} />}</Rail>
        <Handles>
          {({ handles, getHandleProps }) => (
            <div className="slider-handles">
              {handles.map(handle => (
                <Handle key={handle.id} handle={handle} domain={this.props.domain} getHandleProps={getHandleProps} />
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
        <Ticks values={this.props.tickValues}>
          {({ ticks }) => (
            <div className="slider-ticks">
              {ticks.map(tick => (
                <Tick key={tick.id} format={formatTicks} tick={tick} count={ticks.length} />
              ))}
            </div>
          )}
        </Ticks>
      </CompoundSlider>
    )
  }
}
