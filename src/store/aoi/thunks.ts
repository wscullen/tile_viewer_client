import { Action } from 'redux'
import { ThunkAction } from 'redux-thunk'
import { startAddAoi } from './actions'
import { AppState } from '../index'

const path = require('path')

import moment from 'moment'

import {
  AreaOfInterest,
  TileList as TileListInterface,
  Session,
  CurrentDates,
  RawTileByDate,
  DateObject,
} from './types'

import { addAoi } from './actions'

import { RawTile, Tile } from '../tile/types'

import { addTile, updateTile } from '../tile/actions'
import { updateAddAoiForm } from '../session/actions'

export const thunkCheckImageryStatus = (
  tileIdList: string[],
  imageryType: string,
  aoiName: string,
): ThunkAction<void, AppState, null, Action<string>> => async (dispatch: any, getState: any) => {
  console.log('Inside thunk getting checking S3 imagery status')

  const state = getState()
  console.log(state)

  interface StringIndexObject {
    [index: string]: string
  }

  const imageryNameDict: StringIndexObject = {}

  tileIdList.map(id => {
    imageryNameDict[state.tile.byId[id].properties.name] = id
  })

  const imageryNameList = Object.keys(imageryNameDict)

  console.log(imageryNameList)
  const headers = new Headers()

  headers.append('Content-Type', 'application/json')
  headers.append('Authorization', `Bearer ${state.session.settings.auth.accessToken}`)

  const searchParams = new URLSearchParams({
    imagery_list: imageryNameList.join(','),
    data_type: imageryType,
    aoi_name: aoiName,
  })

  fetch(`${state.session.settings.jobManagerUrl}/imagerystatus/?${searchParams}`, {
    method: 'GET',
    headers: headers,
  })
    .then(response => {
      if ([200, 201].includes(response.status)) {
        return response.json()
      } else {
        console.log(response.status)

        throw new Error(response.status.toString())
      }
    })
    .then(response => {
      if (!response.hasOwnProperty('data')) throw response['error']
      interface DataResponse {
        [index: string]: any
        esa?: string
        usgs?: string
      }

      const data = response['data'] as DataResponse

      for (const [key, value] of Object.entries(data)) {
        const existingTile = { ...state.tile.byId[imageryNameDict[key]] }
        console.log(existingTile)

        if (imageryType === 's2_l1c') {
          if (value.esa !== 'object does not exist') {
            existingTile.properties['l1cS3Url'] = `http://zeus684440.agr.gc.ca:9000/s2-l1c-archive/${value.esa +
              '.zip'}`
          } else if (value.usgs !== 'object does not exist') {
            existingTile.properties['l1cS3Url'] = `http://zeus684440.agr.gc.ca:9000/s2-l1c-archive/${value.usgs +
              '.zip'}`
          } else {
            existingTile.properties['l1cS3Url'] = undefined
          }
        }

        dispatch(updateTile(existingTile))
        console.log(existingTile)
      }

      console.log(data)
    })
    .catch(reason => {
      console.log(reason)
    })

  // const aoi = {
  //   id: data['id'],
  //   name: addAoiFormData.get('name'),
  //   startDate: addAoiFormData.get('startDate'),
  //   endDate: addAoiFormData.get('endDate'),
  //   shapefile: Array(addAoiFormData.get('shapefiles')).filter(ele => path.extname(ele.toString()) === '.shp'),
  //   wkt_footprint: data['wkt_footprint'],
  //   mgrs_list: data['mgrs_list'],
  //   wrs_list: data['wrs_list'],
  //   raw_tile_list: data['tile_results'],
  //   wrs_overlay: data['wrs_geojson'],
  //   sensor_list: data['sensor_list'],
  // }

  // console.log(aoi)

  // console.log('Adding area of interest...')

  // const allTileId: TileListInterface = {}

  // const currentDates: CurrentDates = {}

  // const sensorList: string[] = []

  // const selectedTileId: TileListInterface = {}

  // for (const key of Object.keys(aoi.raw_tile_list)) {
  //   console.log(key)
  //   const tiles = data['tile_results'][key]
  //   const sortedTiles = sortTilesByDate(tiles)

  //   const dateList = Object.keys(sortedTiles.datesObject)
  //   sensorList.push(key)
  //   const datesObjectWithIds: DateObject = {}
  //   const selectedInit: DateObject = {}

  //   allTileId[key] = {}
  //   selectedTileId[key] = {}
  //   currentDates[key] = {
  //     dates: [],
  //     currentDate: '',
  //   }
}

export const thunkStartAddAoi = (
  addAoiFormData: FormData,
  resetForm: Function,
): ThunkAction<void, AppState, null, Action<string>> => async (dispatch: any, getState: any) => {
  console.log('Inside thunk trying to submit a new AOI')

  const state = getState()

  const headers = new Headers()

  fetch(`${state.session.settings.jobManagerUrl}/s2d2/submit_aoi/`, {
    method: 'POST',
    body: addAoiFormData,
    headers: headers,
  })
    .then(response => {
      if ([200, 201].includes(response.status)) {
        return response.json()
      } else {
        console.log(response.status)

        throw new Error(response.status.toString())
      }
    })
    .then(response => {
      if (!response.hasOwnProperty('data')) throw response['error']

      const data = response['data']

      console.log(data)

      const aoi = {
        id: data['id'],
        name: addAoiFormData.get('name'),
        startDate: addAoiFormData.get('startDate'),
        endDate: addAoiFormData.get('endDate'),
        shapefile: Array(addAoiFormData.get('shapefiles')).filter(ele => path.extname(ele.toString()) === '.shp'),
        wkt_footprint: data['wkt_footprint'],
        mgrs_list: data['mgrs_list'],
        wrs_list: data['wrs_list'],
        raw_tile_list: data['tile_results'],
        wrs_overlay: data['wrs_geojson'],
        sensor_list: data['sensor_list'],
      }

      console.log(aoi)

      console.log('Adding area of interest...')

      const allTileId: TileListInterface = {}

      const currentDates: CurrentDates = {}

      const sensorList: string[] = []

      const selectedTileId: TileListInterface = {}

      for (const key of Object.keys(aoi.raw_tile_list)) {
        console.log(key)
        const tiles = data['tile_results'][key]
        const sortedTiles = sortTilesByDate(tiles)

        const dateList = Object.keys(sortedTiles.datesObject)
        sensorList.push(key)
        const datesObjectWithIds: DateObject = {}
        const selectedInit: DateObject = {}

        allTileId[key] = {}
        selectedTileId[key] = {}
        currentDates[key] = {
          dates: [],
          currentDate: '',
        }

        for (const d of dateList) {
          console.log(d)
          datesObjectWithIds[d] = sortedTiles.datesObject[d].map((ele): string => ele.geojson.id.toString())
          selectedInit[d] = []
          const tileIds: string[] = []

          for (const t of sortedTiles.datesObject[d]) {
            const idTemp = t.geojson.id
            t.geojson.properties.lowres_preview_url = t.lowres_preview_url

            const tile: Tile = {
              id: t.geojson.id.toString(),
              geometry: t.geojson.geometry,
              type: 'Feature',
              bbox: t.geojson.bbox,
              date: t.date.toISOString(),
              properties: {
                acquisitionEnd: t.geojson.properties.acquisition_end,
                acquisitionStart: t.geojson.properties.acquisition_start,
                apiSource: t.geojson.properties.api_source,
                cloudPercent: parseFloat(t.geojson.properties.cloud_percent),
                datasetName: t.geojson.properties.dataset_name,
                entityId: t.geojson.properties.entity_id,
                manualBulkorderUrl: t.geojson.properties.manual_bulkorder_url,
                manualDownloadUrl: t.geojson.properties.manual_download_url,
                manualProductUrl: t.geojson.properties.manual_product_url,
                metadataUrl: t.geojson.properties.metadata_url,
                mgrs: t.geojson.properties.mgrs,
                name: t.geojson.properties.name,
                pathrow: t.geojson.properties.pathrow,
                platformName: t.geojson.properties.platform_name,
                previewUrl: t.geojson.properties.preview_url,
                satName: t.geojson.properties.sat_name,
                summary: t.geojson.properties.summary,
                vendorName: t.geojson.properties.vendor_name,
                lowresPreviewUrl: t.geojson.properties.lowres_preview_url,
                projection: t.proj,
                l1cS3Url: '',
                l2aS3Url: '',
              },

              selected: false,
              visible: true,
              highlighted: false,
              jobs: [],
            }

            dispatch(addTile(tile))
            tileIds.push(idTemp.toString())
          }
          console.log(tileIds)
          allTileId[key][d] = tileIds
          selectedTileId[key][d] = []
          currentDates[key].dates = Object.keys(allTileId[key])
          currentDates[key].currentDate = Object.keys(allTileId[key])[0]
        }
      }

      console.log(currentDates)

      const session: Session = {
        cloudPercentFilter: 100,
        datesList: currentDates,
        currentPlatform: Object.keys(currentDates)[0],
        settings: {
          atmosphericCorrection: false,
        },
      }

      const areaObject: AreaOfInterest = {
        id: aoi.id,
        endDate: moment(aoi.endDate.toString()).toISOString(),
        startDate: moment(aoi.startDate.toString()).toISOString(),
        mgrsList: aoi.mgrs_list,
        wrsList: aoi.wrs_list,
        wrsOverlay: aoi.wrs_overlay,
        dateCreated: new Date().toISOString(),
        session,
        name: aoi.name.toString().trim(),
        wktFootprint: aoi.wkt_footprint,
        jobs: [],
        allTiles: allTileId,
        selectedTiles: selectedTileId,
        sensorList: aoi.sensor_list,
      }

      console.log(areaObject)

      dispatch(addAoi(areaObject))
      const newFormStatus = {
        success: true,
        finished: true,
        msg: 'Successfully created Area of Interest!',
        submitting: false,
      }
      dispatch(updateAddAoiForm(newFormStatus))
      resetForm()
    })
    .catch(error => {
      console.error('Error:', error)
      const newFormStatus = {
        success: false,
        finished: true,
        msg: `Unable to create Area of Interest (${error}).`,
        submitting: false,
      }
      dispatch(updateAddAoiForm(newFormStatus))

      //   this.setState({
      //     loading: false,
      //     areaCreated: false,
      //     message: 'Something went wrong, unable to create area!',
      //   })
    })
  // done submitting, set submitting to false
}

const sortTilesByDate = (tiles: any) => {
  if (tiles) {
    const formatted_tiles = []
    console.log('sorting tile by date')

    for (const raw_tile of tiles) {
      console.log(raw_tile)

      const proj = raw_tile.epsg_code
      const start_date = moment(raw_tile.acquisition_start)
      const end_date = moment(raw_tile.acquisition_end)
      const mid_date_ts = (start_date.valueOf() + end_date.valueOf()) / 2
      const mid_date = moment(mid_date_ts)
      const tile: RawTile = {
        name: raw_tile.name,
        wkt: raw_tile.footprint,
        lowres_preview_url: raw_tile.preview_url,
        proj,
        date: mid_date,
        cloud: raw_tile['cloud_percent'],
        visible: true,
        geojson: raw_tile['geojson'],
      }

      formatted_tiles.push(tile)
    }

    const groups = formatted_tiles.reduce(
      (groups, tile) => {
        const date = tile.date.format('YYYYMMDD')

        if (!groups[date]) {
          groups[date] = []
        }

        groups[date].push(tile)
        return groups
      },
      {} as RawTileByDate,
    )

    const groupArrays = Object.keys(groups).map(date => {
      return {
        date,
        tiles: groups[date],
      }
    })

    return { datesArray: groupArrays, datesObject: groups }
  }
  return { datesArray: [], datesObject: {} }
}

// export const thunkAttemptLogin = ({
//   email,
//   password,
//   url,
// }: {
//   email: string
//   password: string
//   url: string
// }): ThunkAction<void, AppState, null, Action<string>> => async (dispatch: any, getState: any) => {
//   let session = getState().session

//   dispatch(startLogin())

//   // Create Request body
//   const body = JSON.stringify({
//     email,
//     password,
//   })

//   const newSettings: SessionSettings = {
//     ...session.settings,
//     jobManagerUrl: url,
//     auth: {
//       userEmail: email,
//       userPassword: password,
//     },
//   }

//   const result = await fetch(`${url}/api/token/`, {
//     method: 'POST',
//     mode: 'cors',
//     cache: 'default',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body,
//   })
//     .then(response => {
//       if ([200, 201].includes(response.status)) {
//         return response.json()
//       } else {
//         console.log(response.status)
//         newSettings.loggingIn = false
//         newSettings.authenticated = false
//         newSettings.loginResultMsg = `Unable to reach server (${response.status}`
//         dispatch(finishLogin(newSettings))
//         console.log('finish login here')
//         throw new Error(response.status.toString())
//       }
//     })
//     .then(response => {
//       console.log('Success:', JSON.stringify(response))

//       const now = Date.now().toString()

//       newSettings.auth.accessToken = response.access
//       newSettings.auth.refreshToken = response.refresh
//       newSettings.auth.dateVerified = now
//       newSettings.loggingIn = false
//       newSettings.authenticated = true
//       newSettings.loginResultMsg = 'Successfully logged in.'

//       return getApiVersion(url)
//     })
//     .then(response => {
//       const apiObj = JSON.parse(response)
//       newSettings.loginResultMsg += ` API v${apiObj['version']}`

//       dispatch(finishLogin(newSettings))
//       console.log('finish login here')
//     })
//     .catch(err => {
//       console.log('Something blew up while verifying the API')

//       let loginResultMsg = ''
//       console.log(err)
//       if (err.toString() === 'TypeError: Failed to fetch') {
//         loginResultMsg = 'Unable to reach server with URL provided.'
//       } else if (err.toString() === 'Error: 401') {
//         loginResultMsg = 'Not authorized.'
//       }
//       const newSettings: SessionSettings = {
//         ...session.settings,
//         jobManagerUrl: url,
//         auth: {
//           userEmail: email,
//           userPassword: password,
//         },
//         loggingIn: false,
//         authenticated: false,
//         loginResultMsg: `Failed to login. (${loginResultMsg})`,
//       }

//       dispatch(finishLogin(newSettings))
//       return err
//     })
// }

// export const thunkAuthenticate = ({
//   email,
//   password,
//   url,
// }: {
//   email: string
//   password: string
//   url: string
// }): ThunkAction<void, AppState, null, Action<string>> => async (dispatch: any, getState: any) => {
//   console.log('Trying to update the CSRF tokens')

//   const state = getState()

//   console.log(state)

//   let currentSession = state.session

//   let tokens = await authenticate({ email, password, url }, dispatch, currentSession)
// }

// async function authenticate(
//   {
//     email,
//     password,
//     url,
//   }: {
//     email: string
//     password: string
//     url: string
//   },
//   dispatch: any,
//   session: MainSessionState,
// ) {
//   // Create Request body
//   const body = JSON.stringify({
//     email,
//     password,
//   })

//   const result = await fetch(`${url}/api/token/`, {
//     method: 'POST',
//     mode: 'cors',
//     cache: 'default',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body,
//   })
//     .then(response => response.json())
//     .then(response => {
//       console.log('Success:', JSON.stringify(response))

//       const now = Date.now().toString()
//       session.settings.jobManagerUrl = url
//       session.settings.auth.userEmail = email
//       session.settings.auth.userPassword = password
//       session.settings.auth.accessToken = response.access
//       session.settings.auth.refreshToken = response.refresh
//       session.settings.auth.dateVerified = now
//       dispatch(updateMainSession(session))
//     })
//     .catch(err => {
//       console.log('Something blew up while verifying the API')
//       return err
//     })
// }
