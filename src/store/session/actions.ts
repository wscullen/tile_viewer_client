import {
  UPDATE_MAIN_SESSION,
  AUTHENTICATE,
  START_LOGIN,
  FINISH_LOGIN,
  RESET_STATE,
  UPDATE_ADD_AOI_FORM,
  UPDATE_LOGIN_FORM,
  UPDATE_IMAGERY_STATUS_FORM,
  SessionActionTypes,
  SessionSettings,
  MainSessionState,
  FormUi,
  JWTPayload,
} from './types'

// TypeScript infers that this function is returning SendMessageAction
export function updateAddAoiForm(updatedFormUi: FormUi): SessionActionTypes {
  return {
    type: UPDATE_ADD_AOI_FORM,
    payload: updatedFormUi,
  }
}

export function updateLoginForm(updatedFormUi: FormUi): SessionActionTypes {
  return {
    type: UPDATE_LOGIN_FORM,
    payload: updatedFormUi,
  }
}

export function updateImageryStatusForm(updatedFormUi: FormUi): SessionActionTypes {
  return {
    type: UPDATE_IMAGERY_STATUS_FORM,
    payload: updatedFormUi,
  }
}

export function updateMainSession(sessionState: MainSessionState): SessionActionTypes {
  return {
    type: UPDATE_MAIN_SESSION,
    payload: sessionState,
  }
}

// TypeScript infers that this function is returning SendMessageAction
export function authenticate(sessionState: MainSessionState): SessionActionTypes {
  return {
    type: AUTHENTICATE,
    payload: sessionState,
  }
}

// TypeScript infers that this function is returning SendMessageAction
export function startLogin(): SessionActionTypes {
  return {
    type: START_LOGIN,
  }
}

// TypeScript infers that this function is returning SendMessageAction
export function finishLogin(settings: SessionSettings): SessionActionTypes {
  return {
    type: FINISH_LOGIN,
    settings,
  }
}

// TypeScript infers that this function is returning SendMessageAction
export function resetState(): SessionActionTypes {
  return {
    type: RESET_STATE,
  }
}
