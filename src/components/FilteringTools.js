import './../assets/css/FilteringTools.css'

import React, { Component } from 'react'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { Slider, Rail, Handles, Tracks, Ticks,
  SliderItem,
  GetHandleProps,
  GetTrackProps
} from 'react-compound-slider'

const sliderStyle = {
  margin: '5%',
  position: 'relative',
  width: '90%'
}

const railStyle = {
  position: 'absolute',
  width: '100%',
  height: 14,
  borderRadius: 7,
  cursor: 'pointer',
  backgroundColor: 'rgb(155,155,155)'
}

const Handle = ({
  domain: [min, max],
  handle: { id, value, percent },
  getHandleProps
}) => (
  <div
    role='slider'
    aria-valuemin={min}
    aria-valuemax={max}
    aria-valuenow={value}
    style={{
      left: `${percent}%`,
      position: 'absolute',
      marginLeft: '-11px',
      marginTop: '-6px',
      zIndex: 2,
      width: 24,
      height: 24,
      cursor: 'pointer',
      borderRadius: '50%',
      boxShadow: '1px 1px 1px 1px rgba(0, 0, 0, 0.2)',
      backgroundColor: '#34568f'
    }}
    {...getHandleProps(id)}
  />
)

const Track = ({
  source,
  target,
  getTrackProps
}) => (
  <div
    style={{
      position: 'absolute',
      height: 14,
      zIndex: 1,
      backgroundColor: '#7aa0c4',
      borderRadius: 7,
      cursor: 'pointer',
      left: `${source.percent}%`,
      width: `${target.percent - source.percent}%`
    }}
    {...getTrackProps()}
  />
)

const Tick = ({ tick, count, format }) => (
  <div>
    <div
      style={{
        position: 'absolute',
        marginTop: 14,
        width: 1,
        height: 5,
        backgroundColor: 'rgb(200,200,200)',
        left: `${tick.percent}%`
      }}
    />
    <div
      style={{
        position: 'absolute',
        marginTop: 22,
        fontSize: 10,
        textAlign: 'center',
        marginLeft: `${-(100 / count) / 2}%`,
        width: `${100 / count}%`,
        left: `${tick.percent}%`
      }}
    >
      {format(tick.value)}
    </div>
  </div>
)

const domain = [0, 100]
const formatTicks = (d) => {
  // const feet = Math.floor(d / 12);
  // const inches = d % 12;

  return `${d}`
}

export default class FilteringTools extends Component {
  constructor (props) {
    super(props)

    console.log('Filtering tools constructor.')
    const { cloudPercentFilter } = props
    console.log(cloudPercentFilter)

    this.state = {
      cloudPercentFilter
    }

    console.log(`default state is ${this.state}`)
    console.log(this.state)
  }

  componentDidMount () {
    console.log('======================> Inside component did mount')
    console.log(this.props.cloudPercentFilter)
    // this.setState({
    //   cloudPercentFilter: this.props.cloudPercentFilter
    // })
  }

  componentDidUpdate () {
    console.log('======================> Inside component did update')
    console.log(this.state)
    console.log(this.props)

    // this.setState({
    //   cloudPercentFilter: this.props.cloudPercentFilter
    // })
  }

  render () {
    return (
      <div className='filteringTools'>
        <div className='controlGroup'>
          <button className='selectAllButton' onClick={this.props.selectAll}>Select All Visible</button>
          <button className='deselectAllButton' onClick={this.props.deselectAll}>De-Select All For Current Date</button>
        </div>
        <div className='controlGroup2'>
          <Slider
            mode={1}
            step={1}
            domain={domain}
            rootStyle={sliderStyle}
            onChange={(values) => this.props.updateCloudFilter(values[0])}
            onUpdate={(values) => {
              setTimeout(this.props.updateCloudFilter(values[0]), 150)
            }}
            values={[this.props.cloudPercentFilter]}
          >
            <Rail>
              {({ getRailProps }) => (
                <div style={railStyle} {...getRailProps()} />
              )}
            </Rail>
            <Handles>
              {({ handles, getHandleProps }) => (
                <div className='slider-handles'>
                  {handles.map(handle => (
                    <Handle
                      key={handle.id}
                      handle={handle}
                      domain={domain}
                      getHandleProps={getHandleProps}
                    />
                  ))}
                </div>
              )}
            </Handles>
            <Tracks right={false}>
              {({ tracks, getTrackProps }) => (
                <div className='slider-tracks'>
                  {tracks.map(({ id, source, target }) => (
                    <Track
                      key={id}
                      source={source}
                      target={target}
                      getTrackProps={getTrackProps}
                    />
                  ))}
                </div>
              )}
            </Tracks>
            <Ticks values={[0, 25, 50, 75, 100]}>
              {({ ticks }) => (
                <div className='slider-ticks'>
                  {ticks.map(tick => (
                    <Tick
                      key={tick.id}
                      format={formatTicks}
                      tick={tick}
                      count={ticks.length}
                    />
                  ))}
                </div>
              )}
            </Ticks>
          </Slider>
          <p className='cloudPercent'>{this.props.cloudPercentFilter}</p>
          <label htmlFor='cloudiness' className='ui-label'>Filter by Cloud %</label>
        </div>
      </div>
    )
  }
};
