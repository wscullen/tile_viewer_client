export enum NavigationTabs {
  Map,
  Jobs,
  Details,
}

export interface SessionSettings {
  jobManagerUrl: string
  s2d2Url: string
}

export interface Token {
  key: string
  updated: number
}

export interface CSRFTokens {
  [index: string]: Token
  s2d2: Token
  jobManager: Token
}

export interface MainSessionState {
  currentAoi: string
  activeTab: NavigationTabs
  csrfTokens: CSRFTokens
  settings: SessionSettings
}

export const UPDATE_MAIN_SESSION = 'UPDATE_MAIN_SESSION'

interface UpdateMainSessionAction {
  type: typeof UPDATE_MAIN_SESSION
  payload: MainSessionState
}

export type SessionActionTypes = UpdateMainSessionAction
