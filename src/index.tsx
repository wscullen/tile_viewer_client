import * as React from 'react'
import { render } from 'react-dom'

import { Provider } from 'react-redux'
import configureStore from './store'

import { PersistGate } from 'redux-persist/integration/react'

import App from './components/App'

// Since we are using HtmlWebpackPlugin WITHOUT a template, we should create our own root node in the body element before rendering into it
const root = document.createElement('div')

const { store, persistor } = configureStore()

const Root = () => (
  <Provider store={store}>
    <PersistGate persistor={persistor}>
      <App />
    </PersistGate>
  </Provider>
)

root.id = 'root'
document.body.appendChild(root)

// Now we can render our application into it
render(<Root />, document.getElementById('root'))
