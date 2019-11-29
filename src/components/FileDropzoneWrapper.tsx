import './../assets/css/FileDropzoneWrapper.scss'

import React, { useState } from 'react'
import 'react-dates/initialize'

import { Form, Label } from 'semantic-ui-react'

import Dropzone from 'react-dropzone'

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
  const fileError = errors.hasOwnProperty('files') && touched.hasOwnProperty('files')
  let dropzoneClass = ''
  if (fileError) {
    dropzoneClass = 'dropzoneError'
  } else {
    dropzoneClass = 'dropzone'
  }

  return (
    <div>
      <Form.Field error={fileError}>
        <label>Shapefile for Area Extent</label>
        <div className={dropzoneClass}>
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
                <div {...getRootProps()}>
                  <input {...getInputProps()} />
                  <p>Drag 'n' drop some files here, or click to select files</p>
                  {values.files.map((file: any, i: any) => {
                    return <div key={i}>{file.name}</div>
                  })}
                </div>
              </section>
            )}
          </Dropzone>
        </div>
        {fileError ? (
          <Label prompt pointing>
            {fileError ? errors.files : null}
          </Label>
        ) : null}
      </Form.Field>
    </div>
  )
}

export default FileDropzoneWrapper
