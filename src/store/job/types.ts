export enum JobStatus {
  Submitted,
  Assigned,
  Completed,
}

export interface Job {
  id: string
  type: string
  aoiId: string
  tileId?: string
  submittedDate: string
  assignedDate: string
  completedDate: string
  workerId: string
  success: boolean
  status: JobStatus
  checkedCount: number
  setIntervalId: any
  resultMessage: string
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
