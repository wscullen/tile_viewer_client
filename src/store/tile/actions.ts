import { Tile, ADD_TILE, UPDATE_TILE, UPDATE_TILES, TileActionTypes } from './types'

// TypeScript infers that this function is returning SendMessageAction
export function addTile(newTile: Tile): TileActionTypes {
  return {
    type: ADD_TILE,
    payload: newTile,
  }
}

export function updateTile(existingTile: Tile): TileActionTypes {
  return {
    type: UPDATE_TILE,
    payload: existingTile,
  }
}

export function updateTiles(listOfTiles: Tile[]): TileActionTypes {
  return {
    type: UPDATE_TILES,
    payload: listOfTiles,
  }
}

// // TypeScript infers that this function is returning DeleteMessageAction
// export function deleteMessage(timestamp: number): ChatActionTypes {
//   return {
//     type: DELETE_MESSAGE,
//     meta: {
//       timestamp
//     }
//   }
// }
