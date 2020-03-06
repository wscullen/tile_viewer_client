import { TileState, ADD_TILE, UPDATE_TILE, UPDATE_TILES, TileActionTypes } from './types'

const initialState: TileState = {
  byId: {},
  allIds: [],
}

export function tileReducer(state = initialState, action: TileActionTypes): TileState {
  switch (action.type) {
    case ADD_TILE: {
      const tiles = { ...state }
      tiles.byId[action.payload.id] = { ...action.payload }
      tiles.allIds.push(action.payload.id)

      return {
        ...tiles,
      }
    }
    case UPDATE_TILE: {
      const tiles = { ...state }

      if (state.allIds.includes(action.payload.id)) {
        tiles.byId[action.payload.id] = { ...action.payload }
      }

      return {
        ...tiles,
      }
    }
    case UPDATE_TILES: {
      const tiles = { ...state }

      for (const tile of action.payload) {
        if (tiles.allIds.includes(tile.id)) {
          tiles.byId[tile.id] = { ...tile }
        }
      }

      return {
        ...tiles,
      }
    }
    default:
      return state
  }
}
