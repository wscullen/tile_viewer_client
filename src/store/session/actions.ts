import { UPDATE_MAIN_SESSION, SessionActionTypes, MainSessionState } from './types'

// TypeScript infers that this function is returning SendMessageAction
export function updateMainSession(sessionState: MainSessionState): SessionActionTypes {
  return {
    type: UPDATE_MAIN_SESSION,
    payload: sessionState,
  }
}
