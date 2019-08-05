import { MainSessionState, UPDATE_MAIN_SESSION, SessionActionTypes } from './types'

const initialState: MainSessionState = {
  currentAoi: '',
  activeTab: 0,
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
