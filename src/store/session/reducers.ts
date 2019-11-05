import {
  MainSessionState,
  UPDATE_MAIN_SESSION,
  START_LOGIN,
  FINISH_LOGIN,
  RESET_STATE,
  SessionActionTypes,
} from './types'

const initialState: MainSessionState = {
  currentAoi: '',
  activeTab: 0,
  settings: {
    jobManagerUrl: 'http://hal678772.agr.gc.ca:9090',
    s2d2Url: 'http://hal678772.agr.gc.ca:8000',
    auth: {
      accessToken: '',
      refreshToken: '',
      userEmail: '',
      userPassword: '',
      dateVerified: '',
    },
    authenticated: false,
    loggingIn: false,
    loginResultMsg: '',
  },
  csrfTokens: {
    s2d2: {
      key: '',
      updated: undefined,
    },
    jobManager: {
      key: '',
      updated: undefined,
    },
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
    case START_LOGIN: {
      console.log('Attempting to login given the credentials in the form...')
      let session_settings = { ...state.settings }
      session_settings.loggingIn = true

      return {
        ...state,
        settings: session_settings,
      }
    }
    case FINISH_LOGIN: {
      console.log('Attempting to login given the credentials in the form...')

      return {
        ...state,
        settings: action.settings,
      }
    }
    case RESET_STATE: {
      console.log('WARNING, reseting the session state')
      return initialState
    }
    default:
      return state
  }
}
