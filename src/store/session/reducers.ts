import { MainSessionState, UPDATE_MAIN_SESSION, SessionActionTypes } from './types'

const initialState: MainSessionState = {
  currentAoi: '',
  activeTab: 0,
  settings: {
    jobManagerUrl: 'http://hal678772.agr.gc.ca:9090',
    s2d2Url: 'http://hal678772.agr.gc.ca:8000',
  },
  csrfTokens: {
    s2d2: {
      key: '',
      updated: undefined,
    },
    jobManager: {
      key: '',
      updated: undefined,
    }
  },
}

export function sessionReducer(state = initialState, action: SessionActionTypes): MainSessionState {
  switch (action.type) {
    case UPDATE_MAIN_SESSION: {
      console.log(action.payload)
      return {
        ...action.payload,
      }
    }
    default:
      return state
  }
}
