import { AreaOfInterestState, ADD_AOI, REMOVE_AOI, UPDATE_SESSION, AoiActionTypes } from './types'

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
    case REMOVE_AOI: {
      console.log(action.payload)
      const areasOfInterest = { ...state }

      let aoiId
      for (let [key, val] of Object.entries(areasOfInterest.byId)) {
        if (val.name === action.payload) {
          aoiId = key
        }
      }

      delete areasOfInterest.byId[aoiId]
      areasOfInterest.allIds.splice(areasOfInterest.allIds.indexOf(aoiId), 1)

      return {
        ...areasOfInterest,
      }
    }
    default:
      return state
  }
}
