import './../assets/css/DatePickerFormikWrapper.css'

import React, { useState } from 'react'
import 'react-dates/initialize'
import { DateRangePicker } from 'react-dates'

import { Label, Form } from 'semantic-ui-react'

interface FormInputs {
  setFieldValue: Function
  setFieldTouched: Function
  setFieldError: Function
  values: any
  errors: any
  touched: any
  validateField: any
  setValues: any
  setTouched: any
}

interface DatePickerInputs {
  startDateId: string
  endDateId: string
  form: FormInputs
  field: any
  validate: any
}

const DatePickerWithFormik = ({
  startDateId,
  endDateId,
  form: {
    setFieldValue,
    setFieldTouched,
    setFieldError,
    setValues,
    values,
    errors,
    touched,
    setTouched,
    validateField,
  },
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
  const startDateError = errors.hasOwnProperty('startDate') && touched.hasOwnProperty('startDate')
  const endDateError = errors.hasOwnProperty('endDate') && touched.hasOwnProperty('endDate')

  return (
    <Form.Field error={startDateError || endDateError}>
      <label>Date Range</label>
      <DateRangePicker
        startDate={values.startDate}
        startDateId="Start"
        endDate={values.endDate}
        endDateId="End"
        onDatesChange={({ startDate, endDate }) => {
          console.log('DATES CHANGED=======')
          console.log(startDate)
          console.log(endDate)

          // if (endDate === null) setFieldError('endDate', 'End date is required.')
          setValues({ ...values, startDate: startDate, endDate: endDate })
          setTimeout(() => setTouched({ ...touched, startDate: startDate !== null, endDate: endDate !== null }), 50)
        }}
        focusedInput={focusedInput}
        onFocusChange={focusedInput => {
          setFocusedInput(focusedInput)
          if (focusedInput === null) setTimeout(() => setTouched({ ...touched, startDate: true, endDate: true }), 50)
        }}
        isOutsideRange={() => false}
        displayFormat={() => 'YYYY/MM/DD'}
      />
      {console.log('-----------------------------------------------')}
      {console.log(touched)}
      {console.log(errors)}
      {console.log(values)}

      {startDateError | endDateError ? (
        <Label prompt pointing="left">
          {startDateError ? errors.startDate + ' ' : null}
          {endDateError ? errors.endDate : null}
        </Label>
      ) : null}
    </Form.Field>
  )
}

export default DatePickerWithFormik
