import React from 'react'
import { render } from 'react-dom'
import { Formik, Field } from 'formik'

import { Button, Checkbox as CheckboxSemantic, Form, Message } from 'semantic-ui-react'
import { format } from 'util'

export default function Checkbox(props: any) {
  return (
    <Field name={props.name}>
      {({ field, form }: { field: any; form: any }) => (
        <CheckboxSemantic
          type="checkbox"
          label={props.label}
          {...props}
          checked={field.value.includes(props.value)}
          onChange={() => {
            if (field.value.includes(props.value)) {
              const nextValue = field.value.filter((value: any) => value !== props.value)
              console.log(nextValue)
              form.setFieldValue(props.name, nextValue)
            } else {
              const nextValue = field.value.concat(props.value)
              console.log(nextValue)
              form.setFieldValue(props.name, nextValue)
            }
            // form.setFieldTouched('platforms', true)
          }}
        />
      )}
    </Field>
  )
}
