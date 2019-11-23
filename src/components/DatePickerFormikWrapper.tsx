import './../assets/css/DatePickerFormikWrapper.css'

import React, { useState } from 'react'
import 'react-dates/initialize'
import { DateRangePicker } from 'react-dates'

import { Button, FormFeedback, FormGroup, Label, Input } from 'reactstrap'

interface FormInputs {
  setFieldValue: Function
  setFieldTouched: Function
  values: any
  errors: any
  touched: any
}

interface DatePickerInputs {
  startDateId: string
  endDateId: string
  form: FormInputs
  field: any
}

const DatePickerWithFormik = ({
  startDateId,
  endDateId,
  form: { setFieldValue, setFieldTouched, values, errors, touched },
  field,
  ...props
}: DatePickerInputs) => {
  console.log(values)
  // const [startDate, setStartDpageate] = useState(null);
  // const [endDate, setEndDate] = useState(null);
  const [focusedInput, setFocusedInput] = useState(null)
  // const handleDatesChange = ({ startDate, endDate }) => {
  //   // setStartDate(startDate);
  //   // setEndDate(endDate);
  //   setFieldValue("startDate", startDate);
  //   setFieldValue("endDate", endDate);
  // };

  return (
    <div>
      <DateRangePicker
        startDate={values.startDate}
        startDateId="Start"
        endDate={values.endDate}
        endDateId="End"
        onDatesChange={({ startDate, endDate }) => {
          console.log(startDate)
          console.log(endDate)
          setFieldValue('startDate', startDate)
          setFieldValue('endDate', endDate)
        }}
        focusedInput={focusedInput}
        onFocusChange={focusedInput => setFocusedInput(focusedInput)}
        isOutsideRange={() => false}
        displayFormat={() => 'YYYY/MM/DD'}
      />
      {console.log('-----------------------------------------------')}
      {console.log(touched)}
      {console.log(errors)}
      <br />
      {errors.hasOwnProperty('startDate') && touched.hasOwnProperty('startDate')? (
        <span className="errorMsg">
          {errors.startDate}
          <br />
        </span>
      ) : null}

      {errors.hasOwnProperty('endDate') && touched.hasOwnProperty('endDate') ? <span className="errorMsg">{errors.endDate}</span> : null}
    </div>
  )
}

export default DatePickerWithFormik
