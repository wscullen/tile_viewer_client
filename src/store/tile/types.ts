import { Feature, Geometry } from 'geojson'

export interface Properties {
  acquisitionEnd: string; // "2016-04-12T18:55:46.520000"
  acquisitionStart: string; // "2016-04-12T18:55:46.520000"
  apiSource: string; // ["usgs_ee", "esa_scihub"]
  cloudPercent: number; // 0 - 100 float
  datasetName: string; // ["SENTINEL_2A"]
  entityId: string; // 106965
  lowresPreviewUrl: string; // "http://s2d2.satdat.space/media/lowres_previews/S2A_OPER_MSI_L1C_TL_MTI__20160412T185546_20160412T220337_A004214_T12UUA_N02_01_01.jpg"
  manualBulkorderUrl: string;
  manualDownloadUrl: string; // "https://earthexplorer.usgs.gov/download/external/options/SENTINEL_2A/106965/INVSVC/"
  manualProductUrl: string; // "https://earthexplorer.usgs.gov/order/process?dataset_name=SENTINEL_2A&ordered=106965&node=INVSVC"
  metadataUrl: string; // "https://earthexplorer.usgs.gov/metadata/xml/10880/106965/"
  mgrs: string; // "T12UUA"
  name: string; // "L1C_T12UVA_A020287_20190511T182507"
  pathrow: string; // 004002
  platformName: string; // "Sentinel-2"
  previewUrl: string; // "https://ims.cr.usgs.gov/browse/s2/s2a/2016/04/12/S2A_OPER_MSI_L1C_TL_MTI__20160412T185546_20160412T220337_A004214_T12UUA_N02_01_01.jpg"
  satName: string; // "SENTINEL-2A"
  summary: string; //"Entity ID: S2A_OPER_MSI_L1C_TL_MTI__20160412T185546_20160412T220337_A004214_T12UUA_N02_01_01, Acquisition Date: 12-APR-16, Start Date: 12-APR-16, End Date: 12-APR-16"
  vendorName: string; // name specific to the API source"S2A_OPER_PRD_MSIL1C_PDMC_T12UUA_R070_V20160412T184855_20160412T184855"
}

export interface Tile extends Feature {
  id: string;
  geometry: Geometry;
  properties: Properties;
  date: string;
  selected: boolean;
  visible: boolean;
  highlighted: boolean;
  jobs: Array<string>;
}

export interface StateById {
  byId: Record<string, Tile>;
  allIds: Array<string>;
}

export interface TileState extends StateById{
}

export const ADD_TILE = "ADD_TILE"
export const UPDATE_TILE = "UPDATE_TILE"

interface AddTileAction {
  type: typeof ADD_TILE;
  payload: Tile;
}

interface UpdateTileAction {
  type: typeof UPDATE_TILE;
  payload: Tile;
}

export type TileActionTypes = AddTileAction | UpdateTileAction

// // Describing the shape of the chat's slice of state
// export interface Message {
//   user: string;
//   message: string;
//   timestamp: number;
// }

// export interface ChatState {
//   messages: Message[];
// }

// // Describing the different ACTION NAMES available
// export const SEND_MESSAGE = "SEND_MESSAGE";
// export const DELETE_MESSAGE = "DELETE_MESSAGE";

// interface SendMessageAction {
//   type: typeof SEND_MESSAGE;
//   payload: Message;
// }

// interface DeleteMessageAction {
//   type: typeof DELETE_MESSAGE;
//   meta: {
//     timestamp: number;
//   };
// }

// export type ChatActionTypes = SendMessageAction | DeleteMessageAction;
