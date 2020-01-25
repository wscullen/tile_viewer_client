import { Feature as GeoJsonFeature, Geometry } from 'geojson'

import Feature from 'ol/Feature'

import { Moment } from 'moment'
import VectorLayer from 'ol/layer/Vector'
import ImageLayer from 'ol/layer/Image'

export interface Properties {
  acquisitionEnd: string // "2016-04-12T18:55:46.520000"
  acquisitionStart: string // "2016-04-12T18:55:46.520000"
  apiSource: string // ["usgs_ee", "esa_scihub"]
  cloudPercent: number // 0 - 100 float
  datasetName: string // ["SENTINEL_2A"]
  entityId: string // 106965
  lowresPreviewUrl: string // "http://s2d2.satdat.space/media/lowres_previews/S2A_OPER_MSI_L1C_TL_MTI__20160412T185546_20160412T220337_A004214_T12UUA_N02_01_01.jpg"
  currentPreviewUrl?: string
  manualBulkorderUrl: string
  manualDownloadUrl: string // "https://earthexplorer.usgs.gov/download/external/options/SENTINEL_2A/106965/INVSVC/"
  manualProductUrl: string // "https://earthexplorer.usgs.gov/order/process?dataset_name=SENTINEL_2A&ordered=106965&node=INVSVC"
  metadataUrl: string // "https://earthexplorer.usgs.gov/metadata/xml/10880/106965/"
  mgrs: string // "T12UUA"
  name: string // "L1C_T12UVA_A020287_20190511T182507"
  pathrow: string // 004002
  platformName: string // "Sentinel-2"
  previewUrl: string // "https://ims.cr.usgs.gov/browse/s2/s2a/2016/04/12/S2A_OPER_MSI_L1C_TL_MTI__20160412T185546_20160412T220337_A004214_T12UUA_N02_01_01.jpg"
  satName: string // "SENTINEL-2A"
  summary: string //"Entity ID: S2A_OPER_MSI_L1C_TL_MTI__20160412T185546_20160412T220337_A004214_T12UUA_N02_01_01, Acquisition Date: 12-APR-16, Start Date: 12-APR-16, End Date: 12-APR-16"
  vendorName: string // name specific to the API source"S2A_OPER_PRD_MSIL1C_PDMC_T12UUA_R070_V20160412T184855_20160412T184855"
  projection: string
}

export interface Tile extends GeoJsonFeature {
  id: string
  geometry: Geometry
  properties: Properties
  date: string
  selected: boolean
  visible: boolean
  highlighted: boolean
  jobs: Array<string>
  vectorFeature?: Feature
  rasterFeature?: ImageLayer
}

export interface RawTile {
  name: string
  wkt: string
  lowres_preview_url: string
  proj: string
  date: Moment
  cloud: string
  visible: boolean
  geojson: GeoJsonFeature
}

export interface TileListByDate {
  [index: string]: Tile[]
}

export interface StateById {
  byId: Record<string, Tile>
  allIds: Array<string>
}

export interface TileState extends StateById {}

export const ADD_TILE = 'ADD_TILE'
export const UPDATE_TILE = 'UPDATE_TILE'

interface AddTileAction {
  type: typeof ADD_TILE
  payload: Tile
}

interface UpdateTileAction {
  type: typeof UPDATE_TILE
  payload: Tile
}

export type TileActionTypes = AddTileAction | UpdateTileAction
