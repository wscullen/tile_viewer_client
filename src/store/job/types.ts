import { TileListByDate } from '../tile/types'

export enum JobStatus {
  Submitted,
  Assigned,
  Completed,
}

// "aoi_name": "Test Area 2",
// "window_size": 3,
// "imagery_list": {
//     "sentinel2": {
//         "20190613": [
//             "S2A_MSIL1C_20190613T182921_N0207_R027_T12UUA_20190613T220508"
//         ],
//         "20190616": [],

export interface ImageryByDate {
  [index: string]: string[]
}

export interface ImageryList {
  [index: string]: ImageryByDate
}

export interface L2AJobParameters {
  prevNDays: number
  activeAoiName: string
  imageryList: ImageryList
}

export interface JobParameters {
  ac?: boolean
  acRes?: number[]
  l2a?: L2AJobParameters
}

export interface Job {
  id: string
  type: string
  aoiId: string
  tileId?: string
  tileDict?: TileListByDate
  submittedDate: string
  assignedDate: string
  completedDate: string
  workerId: string
  success: boolean
  status: JobStatus
  checkedCount: number
  setIntervalId: any
  resultMessage: string
  params?: JobParameters
  errorResult?: any
}

export interface StateById {
  byId: Record<string, Job>
  allIds: string[]
  byAoiId: Record<string, string[]>
}

export interface JobState extends StateById {}

export const ADD_JOB = 'ADD_JOB'
export const UPDATE_JOB = 'UPDATE_JOB'
export const REMOVE_JOB = 'REMOVE_JOB'

interface AddJobAction {
  type: typeof ADD_JOB
  payload: Job
}

interface RemoveJobAction {
  type: typeof REMOVE_JOB
  payload: string
}

interface UpdateJobAction {
  type: typeof UPDATE_JOB
  payload: Job
}

export type JobActionTypes = AddJobAction | UpdateJobAction | RemoveJobAction
