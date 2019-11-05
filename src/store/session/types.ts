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
  dateVerified: string
}

export interface JWTPayload {
  access: string
  refresh: string
}

export interface SessionSettings {
  jobManagerUrl: string
  s2d2Url: string
  auth: AuthSettings
  authenticated: boolean
  loggingIn: boolean
  loginResultMsg: string
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
export const START_LOGIN = 'START_LOGIN'
export const FINISH_LOGIN = 'FINISH_LOGIN'

export const RESET_STATE = 'RESET_STATE'

interface UpdateMainSessionAction {
  type: typeof UPDATE_MAIN_SESSION
  payload: MainSessionState
}

interface AuthenticationAction {
  type: typeof AUTHENTICATE
  payload: MainSessionState
}

interface StartLoginAction {
  type: typeof START_LOGIN
}

interface FinishLoginAction {
  type: typeof FINISH_LOGIN
  settings: SessionSettings
}

interface ResetStateAction {
  type: typeof RESET_STATE
}

export type SessionActionTypes =
  | UpdateMainSessionAction
  | AuthenticationAction
  | StartLoginAction
  | FinishLoginAction
  | ResetStateAction
