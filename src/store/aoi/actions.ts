import { AreaOfInterest, ADD_AOI, UPDATE_AOI, REMOVE_AOI, UPDATE_SESSION, AoiActionTypes, Session } from './types'

// TypeScript infers that this function is returning SendMessageAction
export function addAoi(newAoi: AreaOfInterest): AoiActionTypes {
  return {
    type: ADD_AOI,
    payload: newAoi,
  }
}

export function updateAoi(updatedAoi: AreaOfInterest): AoiActionTypes {
  return {
    type: UPDATE_AOI,
    payload: updatedAoi,
  }
}

export function removeAoi(aoiName: string): AoiActionTypes {
  return {
    type: REMOVE_AOI,
    payload: aoiName,
  }
}

// TypeScript infers that this function is returning SendMessageAction
export function updateSession(id: string, session: Session): AoiActionTypes {
  return {
    type: UPDATE_SESSION,
    payload: { id, session },
  }
}
