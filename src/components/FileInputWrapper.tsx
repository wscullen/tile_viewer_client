import React from 'react'

import { Button, FormFeedback, FormGroup, Label, Input } from 'reactstrap'

function FileUpload(props: any) {
  const { field, form } = props

  const handleChange = (e: any) => {
    console.log(field.name)
    console.log(e.currentTarget.files)

    const currentFilesCopy = { ...e.currentTarget.files }
    console.log(currentFilesCopy)

    form.setFieldValue(field.name, currentFilesCopy)
  }

  return (
    <div>
      <Input type="file" name="file" id="file" onChange={(o: any) => handleChange(o)} multiple />
    </div>
  )
}

export default FileUpload
