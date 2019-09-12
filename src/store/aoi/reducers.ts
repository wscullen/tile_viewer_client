import {
  AreaOfInterest,
  AreaOfInterestState,
  ADD_AOI,
  REMOVE_AOI,
  UPDATE_AOI,
  UPDATE_SESSION,
  AoiActionTypes,
} from './types'

import { TileListByDate, Tile } from '../tile/types'

import { AppState } from '../index'

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

// const aois = Object.values(this.props.aois.byId)
//     let currentAoi: AreaOfInterest

//     if (this.props.session.currentAoi !== '') currentAoi = this.props.aois.byId[this.props.session.currentAoi]

//     const selectedTiles: TileListByDate = {}
//     const highlightedTiles: string[] = []
//     let currentTiles: Tile[] = []
//     let currentPlatform = ''
//     let currentDate = ''

//     if (currentAoi) {
//       const session = { ...currentAoi.session }
//       currentPlatform = session.currentPlatform
//       currentDate = currentAoi.session.datesList[currentPlatform].currentDate

//       currentTiles = currentAoi.allTiles[currentPlatform][currentDate].map(id => {
//         return this.props.tiles.byId[id]
//       })

//       console.log(currentTiles)

//       for (const [key, value] of Object.entries(currentAoi.allTiles[currentPlatform])) {
//         const tileArray: Tile[] = []
//         const tileArray2: Tile[] = []
//         value.map((id: string) => {
//           if (this.props.tiles.byId[id].selected) {
//             tileArray.push(this.props.tiles.byId[id])
//           }

//         })
//         selectedTiles[key] = tileArray
//       }
//     }

// interface TileStatus

export function getSelectedTiles(state: AppState): TileListByDate {
  let currentAoi: AreaOfInterest

  if (state.session.currentAoi !== '') {
    currentAoi = state.aoi.byId[state.session.currentAoi]
  }

  const selectedTiles: TileListByDate = {}

  if (currentAoi) {
    const session = { ...currentAoi.session }
    const currentPlatform = session.currentPlatform

    for (const [key, value] of Object.entries(currentAoi.allTiles[currentPlatform])) {
      const tileArray: Tile[] = []
      value.map((id: string): void => {
        if (state.tile.byId[id].selected) {
          tileArray.push(state.tile.byId[id])
        }
      })
      selectedTiles[key] = tileArray
    }
  }

  return selectedTiles
}

export function getHighlightedTiles(state: AppState): string[] {
  let currentAoi: AreaOfInterest

  if (state.session.currentAoi !== '') {
    currentAoi = state.aoi.byId[state.session.currentAoi]
  }

  const highlightedTiles: string[] = []

  if (currentAoi) {
    const session = { ...currentAoi.session }
    const currentPlatform = session.currentPlatform

    for (const [key, value] of Object.entries(currentAoi.allTiles[currentPlatform])) {
      const tileArray: Tile[] = []
      value.map((id: string): void => {
        if (state.tile.byId[id].highlighted) {
          highlightedTiles.push(id)
        }
      })
    }
  }

  return highlightedTiles
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
    case UPDATE_AOI: {
      const areasOfInterest = { ...state }
      areasOfInterest.byId[action.payload.id] = {
        ...action.payload,
      }

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
