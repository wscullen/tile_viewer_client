export enum NavigationTabs {
  Map,
  Jobs,
  Details,
}

export interface AuthSettings {
  userEmail: string
  userPassword: string
  accessToken: string
  refreshToken: string
}

export interface SessionSettings {
  jobManagerUrl: string
  s2d2Url: string
  auth: AuthSettings
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
export const AUTHENTICATE = 'AUTHENTICATE'

interface UpdateMainSessionAction {
  type: typeof UPDATE_MAIN_SESSION
  payload: MainSessionState
}

interface AuthenticationAction {
  type: typeof AUTHENTICATE
  payload: MainSessionState
}

export type SessionActionTypes = UpdateMainSessionAction | AuthenticationAction
