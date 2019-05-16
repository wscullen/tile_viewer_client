import './../assets/css/AddAreaOfInterestModal.css'


import React from 'react';
import PropTypes from 'prop-types';
import momentPropTypes from 'react-moment-proptypes';
import moment from 'moment';
import omit from 'lodash/omit';

import { Formik, FormikProps, Form, Field } from 'formik';

import { DateRangePicker } from 'react-dates';
import { DateRangePickerPhrases } from 'react-dates';
import { DateRangePickerShape } from 'react-dates';
import { START_DATE, END_DATE, HORIZONTAL_ORIENTATION, ANCHOR_LEFT } from 'react-dates/constants';
import { isInclusivelyAfterDay } from 'react-dates';

import { SyncLoader } from 'react-spinners';

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
    'settings'
  ]),
};

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
  displayFormat: () => "YYYY/MM/DD",
  monthFormat: 'MMMM YYYY',
  phrases: DateRangePickerPhrases,

  stateDateWrapper: date => date,

};

class AddAreaOfInterestModal extends React.Component {
  constructor(props) {
    super(props);

    console.log(START_DATE)
    console.log(END_DATE)

    let focusedInput = null;
    if (props.autoFocus) {
      focusedInput = START_DATE;
    } else if (props.autoFocusEndDate) {
      focusedInput = END_DATE;
    }

    this.state = {
      focusedInput,
      startDate: props.initialStartDate,
      endDate: props.initialEndDate,
      platform: "s2_sr",
      files: [],
      loading: false,
      showResult: false,
      areaCreated: false,
      name: '',
    };

    this.onDatesChange = this.onDatesChange.bind(this);
    this.onFocusChange = this.onFocusChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.filesSelected = this.filesSelected.bind(this);
    this.platformSelected = this.platformSelected.bind(this);
    this.submitAreaOfInterest = this.submitAreaOfInterest.bind(this);
    this.modalCleanup = this.modalCleanup.bind(this);


    this.nameUpdated = this.nameUpdated.bind(this);

    this.fileInput = React.createRef();
    this.form = React.createRef();
  }

  onDatesChange({ startDate, endDate }) {
    const { stateDateWrapper } = this.props;
    this.setState({
      startDate: startDate && stateDateWrapper(startDate),
      endDate: endDate && stateDateWrapper(endDate),
    });
  }

  onFocusChange(focusedInput) {
    this.setState({ focusedInput });
  }

  platformSelected(event) {
    console.log(event)
  }

  filesSelected(event) {
    console.log(event)
    this.setState({
      files: Array.from(this.fileInput.current.files)
    });
  }

  nameUpdated(event) {
    console.log(event);
    this.setState({
      name: event.target.value
    })
  }

  showSelectedFiles() {
    return (
      <ul className="fileList">
        {this.state.files.map((ele, index) => {
          return (<li key={index}>{ele.name}</li>)
        })}
        </ul>
    )
  }

  submitAreaOfInterest() {
    let formData = new FormData();

    formData.append('platform', this.state.platform);
    formData.append('startDate', this.state.startDate.format('YYYYMMDD'))
    formData.append('endDate', this.state.endDate.format('YYYYMMDD'))

    for (let f of this.state.files) {
      formData.append('shapefiles', f);
    }

    let headers = new Headers();
    headers.append("X-CSRFToken", this.state.csrf_token);
    // Used for loading status indicators, disable submit button
    this.setState({
      loading: true,
      showResult: true,
      message: 'Request is being processed by the server (this can take a while)...'
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

      const aoi = {
        name: this.state.name,
        startDate: this.state.startDate,
        endDate: this.state.endDate,
        shapefile: this.state.files.filter((ele) => path.extname(ele.name) === '.shp'),
        wkt_footprint: data['wkt_footprint'],
           mgrs_list: data['mgrs_list'],
           wrs_list: data['wrs_list'],
           raw_tile_list: data['tile_results']
      }
      this.props.addAreaOfInterest(aoi);
      console.log(aoi)

      this.form.current.reset();

      this.setState({
        name: '',
        startDate: this.props.initialStartDate,
        endDate: this.props.initialEndDate,
        platform: "s2_sr",
        loading: false,
        areaCreated: true,
        message: "Area created successfully!",
        files: []
      })
    })
    .catch(error => {
      console.error('Error:', error)
      this.setState({
        startDate: this.props.initialStartDate,
        endDate: this.props.initialEndDate,
        platform: "s2_sr",
        loading: false,
        areaCreated: false,
        message: "Something went wrong, unable to create area!",
      })
    });
        //done submitting, set submitting to false
  }

  displayLoadingMessage() {
     if (this.state.message !== "") {
       return (
         <h5>{this.state.message}</h5>
       )
     }
  }
  
  modalCleanup() {
    if (this.state.areaCreated === true)
      this.setState({
        showResult: false,
        message: ''
      })

    this.props.hideModal()
  }
  
  handleSubmit(event) {
    event.preventDefault();
    //process form submission here
    console.log(event)
      // method="post" enctype="multipart/form-data"
      // `Selected file - ${
      //   this.fileInput.current.files[0].name
      // }`
    
    console.log(this.state.platform)
    console.log(this.state.startDate)
    console.log(this.state.endDate)
    for (let f of this.fileInput.current.files) {
      console.log(f.name)
    }

    let headers = new Headers();

    if (this.state.csrf_token === null) {
      fetch(`${this.props.settings.s2d2_url}/generate_csrf/`, {
      method: 'GET',
      mode: 'cors',
      cache: 'default',
      headers: headers
    }).then(response => response.json())
    .then(response => {
      console.log('Success:', JSON.stringify(response))
      this.setState({
        csrf_token: JSON.stringify(response)
      });

      this.submitAreaOfInterest()

    })
    .catch(error => console.error('Error:', error));
    } else {
      this.submitAreaOfInterest()

    }
  
  }

  render() {
    const { focusedInput, startDate, endDate } = this.state;

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
    ]);

    const showHideClassName = this.state.showResult ? "loadingIndicators display-inline" : "loadingIndicators display-none";

    return (
      <Modal show={this.props.show} handleClose={this.modalCleanup}>
          <h2>Area of Interest Constraints</h2>
          <br />
        
      <form onSubmit={this.handleSubmit} ref={this.form}>
      <label htmlFor="aoi_name">Name</label>
      <br />
      <input id="aoi_name" className="aoi_name" type="text" name="aoi_name" value={this.state.name} onChange={this.nameUpdated}/>
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
     
     
      <label htmlFor="platform-select">Platform</label>
      <br />
      <select id="platform-select" value={this.state.platform} onChange={this.platformSelected} >
          <option value="l8_sr" disabled>Landsat-8 (SR)</option>
          <option value="s2_sr">Sentinel-2 (SR)</option>
      </select>
      <button className="createButton" type="submit" disabled={this.state.loading}>Create Area of Interest</button>
    </form>
    <div className={showHideClassName}>
        <SyncLoader
            sizeUnit={"px"}
            margin={"2px"}
            size={15}
            color={'lightgrey'}
            loading={this.state.loading}/>
        <br />
        {this.displayLoadingMessage()}
      </div>

      </Modal>
    );
  }
}

AddAreaOfInterestModal.propTypes = propTypes;
AddAreaOfInterestModal.defaultProps = defaultProps;

export default AddAreaOfInterestModal;