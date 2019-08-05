import { AreaOfInterestState, ADD_AOI, UPDATE_SESSION, AoiActionTypes } from './types'

const initialState: AreaOfInterestState = {
  byId: {},
  allIds: [],
}

export function getAoiNames(state = initialState): string[] {
  const aoiNames: string[] = []

  for (let [key, val] of Object.entries(state.byId)) {
    aoiNames.push(val.name)
  }
  return aoiNames
}

export function aoiReducer(state = initialState, action: AoiActionTypes): AreaOfInterestState {
  switch (action.type) {
    case ADD_AOI: {
      const areasOfInterest = { ...state }
      areasOfInterest.byId[action.payload.id] = action.payload
      areasOfInterest.allIds.push(action.payload.id)
      return {
        ...areasOfInterest,
      }
    }
    case UPDATE_SESSION: {
      console.log(action.payload)
      const areasOfInterest = { ...state }
      const areaOfInterest = areasOfInterest.byId[action.payload.id]
      areaOfInterest.session = { ...action.payload.session }

      return {
        ...areasOfInterest,
      }
    }
    default:
      return state
  }
}
