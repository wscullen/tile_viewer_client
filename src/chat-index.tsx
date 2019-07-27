import * as React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import configureStore from './store'

import { PersistGate } from 'redux-persist/integration/react'

import App from './components/ChatApp'

const { store, persistor } = configureStore()

const Root = () => (
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <App />
    </PersistGate>
  </Provider>
)

render(<Root />, document.getElementById('root'))
