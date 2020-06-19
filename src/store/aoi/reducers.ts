import {
  AreaOfInterest,
  TileList,
  DateObject,
  AreaOfInterestState,
  ADD_AOI,
  REMOVE_AOI,
  UPDATE_AOI,
  UPDATE_SESSION,
  AoiActionTypes,
  DateList,
  ImageryListByTile,
  ImageryDates,
  TileObject,
} from './types'

import { TileListByDate, Tile } from '../tile/types'

import { AppState } from '../index'
import { ImageryList } from '../job/types'

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
//       }
//     }

// interface TileStatus

export function getAllSelectedTiles(state: AppState): string[] {
  let currentAoi: AreaOfInterest
  console.log(state.session)
  if (state.session.currentAoi !== '') {
    currentAoi = state.aoi.byId[state.session.currentAoi]
  }

  const selectedTiles: string[] = []

  if (currentAoi) {
    const session = { ...currentAoi.session }
    const currentPlatform = session.currentPlatform
    if (currentAoi.allTiles[currentPlatform]) {
      for (const [key, value] of Object.entries(currentAoi.allTiles[currentPlatform])) {
        const tileArray: Tile[] = []
        value.map((id: string): void => {
          if (state.tile.byId[id].selected) {
            selectedTiles.push(id)
          }
        })
      }
    }
  }
  return selectedTiles
}

export function getAllSelectedTilesForPlatform(state: AppState, platform: string): string[] {
  let currentAoi: AreaOfInterest
  console.log(state.session)
  if (state.session.currentAoi !== '') {
    currentAoi = state.aoi.byId[state.session.currentAoi]
  }

  const selectedTiles: string[] = []

  if (currentAoi) {
    const session = { ...currentAoi.session }
    const currentPlatform = platform
    if (currentAoi.allTiles[currentPlatform]) {
      for (const [key, value] of Object.entries(currentAoi.allTiles[currentPlatform])) {
        const tileArray: Tile[] = []
        value.map((id: string): void => {
          if (state.tile.byId[id].selected) {
            selectedTiles.push(id)
          }
        })
      }
    }
  }
  return selectedTiles
}

export function getSelectedTiles(state: AppState): TileListByDate {
  let currentAoi: AreaOfInterest
  console.log(state.session)
  if (state.session.currentAoi !== '') {
    currentAoi = state.aoi.byId[state.session.currentAoi]
  }

  const selectedTiles: TileListByDate = {}

  if (currentAoi) {
    const session = { ...currentAoi.session }
    const currentPlatform = session.currentPlatform
    if (currentAoi.allTiles[currentPlatform]) {
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
  }
  return selectedTiles
}

export function getImageryListForSen2Agri(state: AppState): TileList {
  let currentAoi: AreaOfInterest
  console.log(state.session)
  if (state.session.currentAoi !== '') {
    currentAoi = state.aoi.byId[state.session.currentAoi]
  }

  const imageryList: any = {}

  if (currentAoi) {
    const session = { ...currentAoi.session }
    const currentPlatform = session.currentPlatform
    for (const [platform, value] of Object.entries(currentAoi.allTiles)) {
      console.log(platform)
      if (currentAoi.allTiles[currentPlatform]) {
        const selectedTiles: DateObject = {}
        for (const [d, value] of Object.entries(currentAoi.allTiles[platform])) {
          const tileArray: string[] = []
          value.map((id: string): void => {
            if (state.tile.byId[id].selected) {
              tileArray.push(state.tile.byId[id].properties.name)
            }
          })
          selectedTiles[d] = tileArray
        }
        imageryList[platform] = selectedTiles
      }
    }
  }

  return imageryList
}

export function getImageryListByTile(state: AppState): ImageryListByTile {
  let currentAoi: AreaOfInterest
  console.log(state.session)
  if (state.session.currentAoi !== '') {
    currentAoi = state.aoi.byId[state.session.currentAoi]
  }

  const imageryList: any = {}

  if (currentAoi) {
    const session = { ...currentAoi.session }
    for (const [platform, value] of Object.entries(currentAoi.allTiles)) {
      if (currentAoi.allTiles[platform]) {
        const selectedTiles: TileObject = {}

        for (const [d, value] of Object.entries(currentAoi.allTiles[platform])) {
          const imageryDates: ImageryDates = {}
          console.log(d)

          value.map((id: string): void => {
            if (state.tile.byId[id].selected) {
              const tile = state.tile.byId[id]
              const tileName = tile.properties.name
              let platformName = tile.properties.platformName
              const s3Url = tile.properties.l1cS3Url
              let gridTile = ''

              if (platformName === 'Landsat-8') {
                gridTile = tileName.split('_')[2]
                platformName = 'landsat8'
              } else {
                platformName = 'sentinel2'
                gridTile = tileName.split('_')[5].substring(1)
              }

              if (selectedTiles.hasOwnProperty(gridTile)) {
                selectedTiles[gridTile][d] = id
              } else {
                selectedTiles[gridTile] = {}
                selectedTiles[gridTile][d] = id
              }
            }
          })
        }
        imageryList[platform] = selectedTiles
      }
    }
  }
  return imageryList
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
    if (currentAoi.allTiles[currentPlatform]) {
      for (const [key, value] of Object.entries(currentAoi.allTiles[currentPlatform])) {
        const tileArray: Tile[] = []
        value.map((id: string): void => {
          if (state.tile.byId[id].highlighted) {
            highlightedTiles.push(id)
          }
        })
      }
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
