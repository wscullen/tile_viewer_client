import { TileListByDate } from '../tile/types'

export enum JobStatus {
  Submitted = 'S',
  Assigned = 'A',
  Completed = 'C',
}

export interface JobStatusVerbose {
  [index: string]: string
  A: string
  S: string
  C: string
}

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

export interface L3BJobParameters {
  prevNDays: number
  activeAoiName: string
  imageryList: ImageryList
  processingType: 'MONO' | 'N-DAYS' | 'ENDOFSEASON'
  generateModel: boolean
  minLai?: number
  maxLai?: number
  stdLai?: number
  modLai?: number
  minAla?: number
  maxAla?: number
  modAla?: number
  stdAla?: number
  useInra: boolean
  generateFcover: boolean
  generateFapar: boolean
}

export interface JobParameters {
  ac?: boolean
  acRes?: number[]
  l2a?: L2AJobParameters
  l3b?: L3BJobParameters
}

export interface JobInfoObject {
  [index: string]: any
  name: string
  kwargs: any
  args: any
  status: string
  progress: any
}

export interface UploadDownloadProgress {
  [index: string]: number
  upload_progress?: number
  download_progress?: number
}

export interface JobProgress {
  task_progress?: UploadDownloadProgress | JobInfoObject
  task_ids?: Array<Array<string>>
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
  progressInfo?: JobProgress
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
export const ADD_JOBS = 'ADD_JOBS'
export const UPDATE_JOB = 'UPDATE_JOB'
export const UPDATE_JOBS = 'UPDATE_JOBS'
export const REMOVE_JOB = 'REMOVE_JOB'

interface AddJobAction {
  type: typeof ADD_JOB
  payload: Job
}

interface AddJobsAction {
  type: typeof ADD_JOBS
  payload: Job[]
}

interface RemoveJobAction {
  type: typeof REMOVE_JOB
  payload: string
}

interface UpdateJobAction {
  type: typeof UPDATE_JOB
  payload: Job
}

interface UpdateJobsAction {
  type: typeof UPDATE_JOBS
  payload: Job[]
}

export type JobActionTypes = AddJobAction | AddJobsAction | UpdateJobAction | RemoveJobAction | UpdateJobsAction
