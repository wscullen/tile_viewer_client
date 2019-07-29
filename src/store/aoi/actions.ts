import {
  AreaOfInterest,
  ADD_AOI,
  UPDATE_SESSION,
  AoiActionTypes,
  Session,
} from './types'

// TypeScript infers that this function is returning SendMessageAction
export function addAoi(newAoi: AreaOfInterest): AoiActionTypes {
  return {
    type: ADD_AOI,
    payload: newAoi,
  }
}

// TypeScript infers that this function is returning SendMessageAction
export function updateSession(id: string, session: Session): AoiActionTypes {
  return {
    type: UPDATE_SESSION,
    payload: { id, session },
  }
}
