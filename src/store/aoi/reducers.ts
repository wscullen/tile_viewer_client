import {
  AreaOfInterestState,
  ADD_AOI,
  AoiActionTypes
} from "./types";

const initialState: AreaOfInterestState = {
  areasOfInterest: {
    byId: {},
    allIds: []
  }
};

export function aoiReducer(
  state = initialState,
  action: AoiActionTypes
): AreaOfInterestState {
  switch (action.type) {
    case ADD_AOI: {
      let areasOfInterest = { ...state.areasOfInterest }
      areasOfInterest.byId[action.payload.id] = action.payload
      areasOfInterest.allIds.push(action.payload.id)
      return {
        areasOfInterest
      };
    }
    default:
      return state;
  }
}
