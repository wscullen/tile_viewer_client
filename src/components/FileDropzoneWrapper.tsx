import './../assets/css/DatePickerFormikWrapper.css'

import React, { useState } from 'react'
import 'react-dates/initialize'
import { DateRangePicker } from 'react-dates'

import Dropzone from 'react-dropzone'

import { Icon, Label, Form } from 'semantic-ui-react'

interface FormInputs {
  setFieldValue: Function
  setFieldTouched: Function
  setFieldError: Function
  values: any
  errors: any
  touched: any
  validateField: Function
}

interface FileDropzoneInputs {
  form: FormInputs
  field: any
  filesValidator: Function
}

const FileDropzoneWrapper = ({
  form: { setFieldValue, setFieldTouched, setFieldError, values, errors, touched, validateField },
  field,
  filesValidator,
  ...props
}: FileDropzoneInputs) => {
  console.log(values)

  const [focusedInput, setFocusedInput] = useState(null)

  return (
    <Form.Field error={errors.hasOwnProperty('files') && touched.hasOwnProperty('files')}>
      <label>Shapefile for Site Extent</label>
      <div className="dropzone input">
        <Dropzone
          onDrop={acceptedFiles => {
            // do nothing if no files
            if (acceptedFiles.length === 0) {
              return
            }
            console.log('acceptedFiles')
            console.log(acceptedFiles)
            // on drop we add to the existing files
            console.log('file values')

            let error = filesValidator(acceptedFiles)
            console.log(error)

            // setFieldTouched('files', true)
            setFieldError('files', error)

            setFieldValue('files', acceptedFiles, false)
            setFieldTouched('files', true)
          }}
        >
          {({ getRootProps, getInputProps }) => (
            <section>
              <div {...getRootProps()} className="dropzoneHeader">
                <Icon name="upload" />
                <input {...getInputProps()} />
                <span className="header">Drag 'n' drop some files here, or click to select files</span>
                {values.files.length !== 0 ? (
                  <div className="dropzoneFiles">
                    <ul>
                      {values.files.map((file: any, i: any) => {
                        return <li key={i}>{file.name}</li>
                      })}
                    </ul>
                  </div>
                ) : null}
              </div>
            </section>
          )}
        </Dropzone>
      </div>
      {console.log(`Dropzone errors: ${errors.files}`)}
      {errors.hasOwnProperty('files') && touched.hasOwnProperty('files') ? (
        <Label prompt pointing={'above'}>
          {errors.files}
        </Label>
      ) : null}
    </Form.Field>
  )
}

export default FileDropzoneWrapper
