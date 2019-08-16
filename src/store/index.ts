import { createStore, combineReducers, applyMiddleware, Store } from 'redux'
import thunkMiddleware from 'redux-thunk'
import { composeWithDevTools } from 'redux-devtools-extension'

import { persistStore, persistReducer, Persistor } from 'redux-persist'
import storage from 'redux-persist/lib/storage'

import { systemReducer } from './system/reducers'
import { chatReducer } from './chat/reducers'

import { tileReducer } from './tile/reducers'
import { aoiReducer } from './aoi/reducers'
import { sessionReducer } from './session/reducers'
import { jobReducer } from './job/reducers'

const persistConfig = {
  key: 'root',
  storage,
}

const rootReducer = combineReducers({
  system: systemReducer,
  chat: chatReducer,
  tile: tileReducer,
  aoi: aoiReducer,
  session: sessionReducer,
  job: jobReducer,
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

export type AppState = ReturnType<typeof rootReducer>

interface ReduxPersistObject {
  store: Store
  persistor: Persistor
}

export default function configureStore(): ReduxPersistObject {
  const middlewares = [thunkMiddleware]
  const middleWareEnhancer = applyMiddleware(...middlewares)

  const store = createStore(persistedReducer, composeWithDevTools(middleWareEnhancer))

  const persistor = persistStore(store)

  return { store, persistor }
}
