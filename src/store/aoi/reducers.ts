import {
  AreaOfInterestState,
  ADD_AOI,
  UPDATE_SESSION,
  AoiActionTypes
} from "./types";

const initialState: AreaOfInterestState = {
  byId: {},
  allIds: []
};

export function aoiReducer(
  state = initialState,
  action: AoiActionTypes
): AreaOfInterestState {
  switch (action.type) {
    case ADD_AOI: {
      const areasOfInterest = { ...state }
      areasOfInterest.byId[action.payload.id] = action.payload
      areasOfInterest.allIds.push(action.payload.id)
      return {
        ...areasOfInterest
      };
    }
    case UPDATE_SESSION: {
      const areasOfInterest = { ...state }
      const areaOfInterest = areasOfInterest.byId[action.payload.id]
      areaOfInterest.session = { ...action.payload.session }
      
      return {
        ...areasOfInterest
      };
    }
    default:
      return state;
  }
}
