import './../assets/css/AddAreaOfInterestModal.css'

import React from 'react'
import PropTypes from 'prop-types'
import momentPropTypes from 'react-moment-proptypes'
import moment from 'moment'
import omit from 'lodash/omit'

import { Formik, FormikProps, Form, Field } from 'formik'

import { DateRangePicker, DateRangePickerPhrases, DateRangePickerShape, isInclusivelyAfterDay } from 'react-dates'

import { START_DATE, END_DATE, HORIZONTAL_ORIENTATION, ANCHOR_LEFT } from 'react-dates/constants'

import { SyncLoader } from 'react-spinners'

import Modal from './Modal'

const path = require('path')

const propTypes = {
  // example props for the demo
  autoFocus: PropTypes.bool,
  autoFocusEndDate: PropTypes.bool,
  stateDateWrapper: PropTypes.func,
  initialStartDate: momentPropTypes.momentObj,
  initialEndDate: momentPropTypes.momentObj,

  ...omit(DateRangePickerShape, [
    'startDate',
    'endDate',
    'onDatesChange',
    'focusedInput',
    'onFocusChange',
    'startDateId',
    'endDateId',
    'settings',
    'aoiNames',
  ]),
}

const defaultProps = {
  // example props for the demo
  autoFocus: false,
  autoFocusEndDate: false,
  initialStartDate: null,
  initialEndDate: null,

  // input related props
  startDateId: START_DATE,
  startDatePlaceholderText: 'Start Date',
  endDateId: END_DATE,
  endDatePlaceholderText: 'End Date',
  disabled: false,
  required: false,
  screenReaderInputMessage: '',
  showClearDates: false,
  showDefaultInputIcon: false,
  customInputIcon: null,
  customArrowIcon: null,
  customCloseIcon: null,
  block: false,
  small: false,
  regular: false,

  // calendar presentation and interaction related props
  renderMonthText: null,
  orientation: HORIZONTAL_ORIENTATION,
  anchorDirection: ANCHOR_LEFT,
  horizontalMargin: 0,
  withPortal: false,
  withFullScreenPortal: false,
  initialVisibleMonth: null,
  numberOfMonths: 2,
  keepOpenOnDateSelect: false,
  reopenPickerOnClearDates: false,
  isRTL: false,

  // navigation related props
  navPrev: null,
  navNext: null,
  onPrevMonthClick() {},
  onNextMonthClick() {},
  onClose() {},

  // day presentation and interaction related props
  renderCalendarDay: undefined,
  renderDayContents: null,
  minimumNights: 1,
  enableOutsideDays: false,
  isDayBlocked: () => false,
  // isOutsideRange: day => !isInclusivelyAfterDay(day, moment()),
  isOutsideRange: day => false,
  isDayHighlighted: () => false,

  // internationalization
  displayFormat: () => 'YYYY/MM/DD',
  monthFormat: 'MMMM YYYY',
  phrases: DateRangePickerPhrases,

  stateDateWrapper: date => date,
}

class AddAreaOfInterestModal extends React.Component {
  constructor(props) {
    super(props)

    console.log(START_DATE)
    console.log(END_DATE)

    let focusedInput = null
    if (props.autoFocus) {
      focusedInput = START_DATE
    } else if (props.autoFocusEndDate) {
      focusedInput = END_DATE
    }

    this.state = {
      focusedInput,
      startDate: props.initialStartDate,
      endDate: props.initialEndDate,
      platforms: [],
      files: [],
      loading: false,
      showResult: false,
      areaCreated: false,
      name: '',
      formValid: false,
      nameErrorMessage: '',
    }

    this.fileInput = React.createRef()
    this.form = React.createRef()
  }

  onDatesChange = ({ startDate, endDate }) => {
    const { stateDateWrapper } = this.props
    this.setState({
      startDate: startDate && stateDateWrapper(startDate),
      endDate: endDate && stateDateWrapper(endDate),
    })
  }

  onFocusChange = focusedInput => {
    this.setState({ focusedInput })
  }

  platformSelected = event => {
    const platformName = event.target.name
    const platforms = [...this.state.platforms]
    const platformIndex = platforms.indexOf(platformName)

    if (platformIndex === -1) {
      platforms.push(platformName)
    } else {
      platforms.splice(platformIndex, 1)
    }

    this.setState({
      platforms,
    })
  }

  filesSelected = event => {
    console.log(event)
    this.setState({
      files: Array.from(this.fileInput.current.files),
    })
  }

  nameUpdated = event => {
    console.log(event)
    this.setState({
      name: event.target.value,
    })
  }

  showSelectedFiles = () => {
    return (
      <ul className="fileList">
        {this.state.files.map((ele, index) => {
          return <li key={index}>{ele.name}</li>
        })}
      </ul>
    )
  }

  submitAreaOfInterest = () => {
    const formData = new FormData()

    // should be an array once s2 and l8 are supported together
    formData.append('platforms', this.state.platforms)
    formData.append('startDate', this.state.startDate.format('YYYYMMDD'))
    formData.append('endDate', this.state.endDate.format('YYYYMMDD'))

    for (const f of this.state.files) {
      formData.append('shapefiles', f)
    }

    const headers = new Headers()
    headers.append('X-CSRFToken', this.state.csrf_token)
    // Used for loading status indicators, disable submit button
    this.setState({
      loading: true,
      showResult: true,
      message: 'Request is being processed by the server (this can take a while)...',
    })

    fetch(`${this.props.settings.s2d2_url}/submit_aoi/`, {
      method: 'POST',
      body: formData,
      headers: headers,
    })
      .then(response => response.json())
      .then(response => {
        console.log('Success:', JSON.stringify(response))

        const data = response['data']
        console.log(this.state.files)

        console.log('WRS GEOJSON')
        console.log(data['wrs_geojson'])

        const aoi = {
          id: data['id'],
          name: this.state.name,
          startDate: this.state.startDate,
          endDate: this.state.endDate,
          shapefile: this.state.files.filter(ele => path.extname(ele.name) === '.shp'),
          wkt_footprint: data['wkt_footprint'],
          mgrs_list: data['mgrs_list'],
          wrs_list: data['wrs_list'],
          raw_tile_list: data['tile_results'],
          wrs_overlay: data['wrs_geojson'],
          sensor_list: data['sensor_list'],
        }
        this.props.addAreaOfInterest(aoi)
        console.log(aoi)

        this.form.current.reset()

        this.setState({
          name: '',
          startDate: this.props.initialStartDate,
          endDate: this.props.initialEndDate,
          platform: 's2_sr',
          loading: false,
          areaCreated: true,
          message: 'Area created successfully!',
          files: [],
        })
      })
      .catch(error => {
        console.error('Error:', error)
        this.setState({
          startDate: this.props.initialStartDate,
          endDate: this.props.initialEndDate,
          platform: 's2_sr',
          loading: false,
          areaCreated: false,
          message: 'Something went wrong, unable to create area!',
        })
      })
    // done submitting, set submitting to false
  }

  displayLoadingMessage = () => {
    if (this.state.message !== '') {
      return <h5>{this.state.message}</h5>
    }
  }

  modalCleanup = () => {
    if (this.state.areaCreated === true) {
      this.setState({
        showResult: false,
        message: '',
      })
    }

    this.props.hideModal()
  }

  validateName = name => {
    console.log(name)
    let valid = true

    if (this.props.aoiNames.includes(name)) {
      valid = false
      this.setState({
        nameErrorMessage: 'Name already taken.',
      })
    }

    if (name.length < 5) {
      valid = false
      console.log('name too short')
      this.setState({
        nameErrorMessage: 'Name too short.',
      })
    }

    return valid
  }

  handleSubmit = event => {
    event.preventDefault()
    // process form submission here
    console.log(event)
    // method="post" enctype="multipart/form-data"
    // `Selected file - ${
    //   this.fileInput.current.files[0].name
    // }`

    const nameValid = this.validateName(this.state.name)

    if (!nameValid) {
      return
    }

    console.log(this.state.platform)
    console.log(this.state.startDate)
    console.log(this.state.endDate)
    for (const f of this.fileInput.current.files) {
      console.log(f.name)
    }

    this.setState({
      nameErrorMessage: '',
    })

    const headers = new Headers()

    if (this.state.csrf_token === null) {
      fetch(`${this.props.settings.s2d2_url}/generate_csrf/`, {
        method: 'GET',
        mode: 'cors',
        cache: 'default',
        headers: headers,
      })
        .then(response => response.json())
        .then(response => {
          console.log('Success:', JSON.stringify(response))
          this.setState({
            csrf_token: JSON.stringify(response),
          })

          this.submitAreaOfInterest()
        })
        .catch(error => console.error('Error:', error))
    } else {
      this.submitAreaOfInterest()
    }
  }

  render() {
    const { focusedInput, startDate, endDate } = this.state

    // autoFocus, autoFocusEndDate, initialStartDate and initialEndDate are helper props for the
    // example wrapper but are not props on the SingleDatePicker itself and
    // thus, have to be omitted.
    const props = omit(this.props, [
      'autoFocus',
      'autoFocusEndDate',
      'initialStartDate',
      'initialEndDate',
      'stateDateWrapper',
      'hideModal',
      'show',
      'addAreaOfInterest',
      'settings',
      'aoiNames',
    ])

    const showHideClassName = this.state.showResult
      ? 'loadingIndicators display-inline'
      : 'loadingIndicators display-none'

    const landsat8Selected = this.state.platforms.indexOf('landsat8') !== -1
    const sentinel2Selected = this.state.platforms.indexOf('sentinel2') !== -1

    return (
      <Modal show={this.props.show} handleClose={this.modalCleanup}>
        <h2>Area of Interest Constraints</h2>

        <form onSubmit={this.handleSubmit} ref={this.form}>
          <h4>Name</h4>
          <input
            id="aoi_name"
            className="aoi_name"
            type="text"
            name="aoi_name"
            value={this.state.name}
            onChange={this.nameUpdated}
          />
          {this.state.nameErrorMessage}
          <h4>Date Range</h4>
          <DateRangePicker
            {...props}
            onDatesChange={this.onDatesChange}
            onFocusChange={this.onFocusChange}
            focusedInput={focusedInput}
            startDate={startDate}
            endDate={endDate}
            startDateId={START_DATE}
            endDateId={END_DATE}
          />
          {/* {% csrf_token %} */}
          <br />
          <h4>Select Shapefile (and associated files) for AOI Extent</h4>

          <input type="file" name="shapefiles" ref={this.fileInput} multiple onChange={this.filesSelected} />
          {this.showSelectedFiles()}

          <h4>Platforms</h4>
          <div>
            <input
              type="checkbox"
              id="landsat8"
              name="landsat8"
              checked={landsat8Selected}
              onChange={this.platformSelected}
            />
            <label htmlFor="landsat8">Landsat 8</label>
          </div>
          <div>
            <input
              type="checkbox"
              id="sentinel2"
              name="sentinel2"
              checked={sentinel2Selected}
              onChange={this.platformSelected}
            />
            <label htmlFor="sentinel2">Sentinel 2</label>
          </div>
          <button className="createButton" type="submit" disabled={this.state.loading}>
            Create Area of Interest
          </button>
        </form>
        <div className={showHideClassName}>
          <SyncLoader sizeUnit={'px'} margin={'2px'} size={15} color={'lightgrey'} loading={this.state.loading} />
          <br />
          {this.displayLoadingMessage()}
        </div>
      </Modal>
    )
  }
}

AddAreaOfInterestModal.propTypes = propTypes
AddAreaOfInterestModal.defaultProps = defaultProps

export default AddAreaOfInterestModal
