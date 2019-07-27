import { createStore, combineReducers, applyMiddleware } from 'redux'
import thunkMiddleware from 'redux-thunk'
import { composeWithDevTools } from 'redux-devtools-extension'

import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'

import { systemReducer } from './system/reducers'
import { chatReducer } from './chat/reducers'

import { tileReducer } from './tile/reducers'
import { aoiReducer } from './aoi/reducers'

const persistConfig = {
  key: 'root',
  storage,
}

const rootReducer = combineReducers({
  system: systemReducer,
  chat: chatReducer,
  tile: tileReducer,
  aoi: aoiReducer,
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

export type AppState = ReturnType<typeof rootReducer>

export default function configureStore() {
  const middlewares = [thunkMiddleware]
  const middleWareEnhancer = applyMiddleware(...middlewares)

  const store = createStore(
    persistedReducer,
    composeWithDevTools(middleWareEnhancer)
  )

  const persistor = persistStore(store)

  return { store, persistor }
}
