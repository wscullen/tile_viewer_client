import './../assets/css/DatePickerFormikWrapper.scss'

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
  title: string
  valueName: string
  name: string
  index: number
}

const FileDropzoneWrapper = ({
  form: { setFieldValue, setFieldTouched, setFieldError, values, errors, touched, validateField },
  field,
  filesValidator,
  ...props
}: FileDropzoneInputs) => {
  console.log(values)

  const [focusedInput, setFocusedInput] = useState(null)

  console.log(errors)
  let errorNode = undefined
  let showError = false

  let fieldNameSplit = field.name.split('.')
  let index = undefined
  let fieldName = undefined
  if (fieldNameSplit.length > 0) {
    index = fieldNameSplit[1]
    fieldName = fieldNameSplit[0]
  }

  console.log(field.name)
  console.log(fieldName)
  console.log(index)

  if (index !== undefined) {
    if (errors.hasOwnProperty(fieldName) && touched.hasOwnProperty(fieldName)) {
      if (errors[fieldName].hasOwnProperty(index) && touched[fieldName].hasOwnProperty(index)) {
     
        if (errors[fieldName][index]) {
          console.log(`Dropzone errors: ${errors[fieldName][index]}`)
          console.log('hello')
  
          console.log(errors[fieldName][index])

          errorNode = (<Label prompt pointing={'above'}>
            {errors[fieldName][index]}
          </Label>)
          showError = true
        }
       
      }
    } 
  } else {
    if (errors.hasOwnProperty(fieldName) && touched.hasOwnProperty(fieldName)) {
      console.log(`Dropzone errors: ${errors[fieldName]}`)

      errorNode = (<Label prompt pointing={'above'}>
        {errors[fieldName]}
      </Label>)
      showError = true
    } 
  }
  
  return (
    <Form.Field error={showError}>
      <label>{props.title}</label>
      <div className="dropzone input">
        <Dropzone
          onDrop={acceptedFiles => {
            // do nothing if no files
            if (acceptedFiles.length === 0) {
              return
            }
            console.log(field.name)
            console.log('acceptedFiles')
            console.log(acceptedFiles)
            // on drop we add to the existing files
            console.log('file values')
            let fieldNameSplit = field.name.split('.')
            let index = undefined
            let fieldName = undefined
            console.log('Teessssssssssssssssssssssssssssting')
            console.log(fieldNameSplit)

              if (fieldNameSplit.length > 1) {
                console.log('-00-0-0-111111111111111111111-00--0-0-0-0-0-0-0-0')

                
                index = fieldNameSplit[1]
                fieldName = fieldNameSplit[0]
                
                let error = filesValidator(acceptedFiles, index)

                console.log(`${fieldName}[${index}]`)
                setFieldTouched(`${fieldName}[${index}]`, true)
                console.log(`${fieldName}[${index}]`)
                setFieldError(`${fieldName}[${index}]`, error)
    
                setFieldValue(`${fieldName}[${index}]`, acceptedFiles, false)
                setFieldTouched(`${fieldName}[${index}]`, true)
              } else {
                fieldName = fieldNameSplit[0]
                console.log('-00-0-0-0000000000000000-00--0-0-0-0-0-0-0-0')

                let error = filesValidator(acceptedFiles)

                console.log(`${fieldName}`)
                setFieldTouched(`${fieldName}`, true)
                console.log(`${fieldName}`)
                setFieldError(`${fieldName}`, error)
    
                setFieldValue(`${fieldName}`, acceptedFiles, false)
                setFieldTouched(`${fieldName}`, true)
              }
            
          
          }}
        >
          {({ getRootProps, getInputProps }) => {
            let fieldNameSplit = field.name.split('.')
            let index = undefined
            let fieldName = undefined
            if (fieldNameSplit.length > 0) {
              index = fieldNameSplit[1]
              fieldName = fieldNameSplit[0]
            }

            return (
            <section>
              <div {...getRootProps()} className="dropzoneHeader">
                <Icon name="upload" />
                <input {...getInputProps()} />
                <span className="header">Drag 'n' drop some files here, or click to select files</span>
                {console.log(values)}
                {console.log(fieldName)}
                {console.log(index)}
                {index !== undefined ? (values[fieldName][index].length !== 0 ? (
                  <div className={"dropzoneFiles"}>
                    <ul>
                      {values[fieldName][index].map((file: any, i: any) => {
                        console.log('FUK')
                        console.log(file)
                        return <li key={i}>{file.name}</li>
                      })}
                    </ul>
                  </div>
                ) : null)
                :
                (values[fieldName].length !== 0 ? (
                  <div className={"dropzoneFiles"}>
                    <ul>
                      {values[fieldName].map((file: any, i: any) => {
                        console.log('SUP')
                        console.log(file)

                        return <li key={i}>{file.name}</li>
                      })}
                    </ul>
                  </div>
                ) : null )}
              </div>
            </section>
          )}}
        </Dropzone>
      </div>

      {errorNode}
     
    </Form.Field>
  )
}

export default FileDropzoneWrapper
