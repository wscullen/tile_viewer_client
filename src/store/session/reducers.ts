import {
  MainSessionState,
  UPDATE_MAIN_SESSION,
  START_LOGIN,
  FINISH_LOGIN,
  RESET_STATE,
  SessionActionTypes,
  UPDATE_ADD_AOI_FORM,
  UPDATE_LOGIN_FORM,
} from './types'

const initialState: MainSessionState = {
  currentAoi: '',
  activeTab: 0,
  activeJobTab: 0,
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
  },
  forms: {
    addAoi: {
      submitting: false,
      finished: false,
      success: false,
      msg: '',
    },
    login: {
      submitting: false,
      finished: false,
      success: false,
      msg: '',
    },
    createL2AJob: {
      submitting: false,
      finished: false,
      success: false,
      msg: '',
    },
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
    case UPDATE_ADD_AOI_FORM: {
      const sessionState = { ...state }
      console.log(action.payload)
      sessionState.forms.addAoi = { ...action.payload }
      console.log(sessionState)
      return sessionState
    }
    case UPDATE_LOGIN_FORM: {
      const sessionState = { ...state }
      sessionState.forms.login = {
        ...sessionState.forms.login,
        ...action.payload,
      }
      return sessionState
    }
    case START_LOGIN: {
      console.log('Attempting to login given the credentials in the form...')
      let session_settings = { ...state.settings }

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
