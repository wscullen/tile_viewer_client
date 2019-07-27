import {
  TileState,
  ADD_TILE,
  TileActionTypes
} from "./types";

const initialState: TileState = {
  tiles: {
    byId: {},
    allIds: []
  }
};

export function tileReducer(
  state = initialState,
  action: TileActionTypes
): TileState {
  switch (action.type) {
    case ADD_TILE:
      let tiles = { ...state.tiles }
      tiles.byId[action.payload.id] = action.payload
      tiles.allIds.push(action.payload.id)
      return {
        tiles
      };
    default:
      return state;
  }
}
