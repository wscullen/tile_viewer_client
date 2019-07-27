import { AreaOfInterest, ADD_AOI, AoiActionTypes } from './types'

// TypeScript infers that this function is returning SendMessageAction
export function addAoi(newAoi: AreaOfInterest): AoiActionTypes {
  return {
    type: ADD_AOI,
    payload: newAoi
  }
}

