import { FeatureCollection } from 'geojson'

export interface DateList {
  dates: Array<string>;
  currentDate: string;
}

export interface CurrentDates {
  [index: string]: DateList;
  landsat8: DateList;
  sentinel2: DateList;
}

export interface Session {
  cloudPercentFilter: number;
  datesList: CurrentDates;
  currentPlatform: string;
}

export interface DateObject {
  [index: string]: string[]
}

export interface TileList {
  [index: string]: DateObject;
  sentinel2: DateObject;
  landsat8: DateObject;
}

export interface AreaOfInterest {
  id: string;
  endDate: string;
  mgrsList: Array<string>;
  name: string;
  allTiles: TileList;
  selectedTiles: TileList;
  startDate: string;
  wktFootprint: string;
  wrsList: Array<string>;
  dateCreated: string;
  wrsOverlay: FeatureCollection;
  session: Session;
  jobs: Array<string>;
  sensorList: Array<string>;
}

export interface StateById {
  byId: Record<string, AreaOfInterest>;
  allIds: Array<string>;
}

export interface AreaOfInterestState extends StateById {

}

export const ADD_AOI = "ADD_AOI"
export const UPDATE_SESSION = "UPDATE_SESSION"

interface AddAoiAction {
  type: typeof ADD_AOI;
  payload: AreaOfInterest;
}

interface UpdateSessionAction {
  type: typeof UPDATE_SESSION;
  payload: { session: Session, id: string };
}

export type AoiActionTypes = AddAoiAction | UpdateSessionAction