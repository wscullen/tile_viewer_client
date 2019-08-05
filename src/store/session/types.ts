enum NavigationTabs {
  Map,
  Jobs,
  Details,
}

export interface MainSessionState {
  currentAoi: string
  activeTab: NavigationTabs
}

export const UPDATE_MAIN_SESSION = 'UPDATE_MAIN_SESSION'

interface UpdateMainSessionAction {
  type: typeof UPDATE_MAIN_SESSION
  payload: MainSessionState
}

export type SessionActionTypes = UpdateMainSessionAction
