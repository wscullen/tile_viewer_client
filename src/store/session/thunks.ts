import { Action } from 'redux'
import { ThunkAction } from 'redux-thunk'
import { updateMainSession } from './actions'
import { AppState } from '../index'

import { MainSessionState, SessionSettings, Token } from './types'

export const thunkUpdateCsrfTokens = (): ThunkAction<void, AppState, null, Action<string>> => async (dispatch: any, getState: any) => {
  console.log('Trying to update the CSRF tokens')

  const state = getState()

  await getCSRFTokens(state.session, dispatch)

}

async function getCSRFTokens(session: MainSessionState, dispatch: any) {

  const csrfRequestPromises = []

  for (const [key, apiUrl] of Object.entries(session.settings)) {

    console.log(apiUrl)
    console.log(key)

    const apiName = key.slice(0, -3)
    console.log(apiName)

    const token = await getCSRFToken(apiUrl)
    if (token.length !== 0) {
      session.csrfTokens[apiName].key = token
      session.csrfTokens[apiName].updated = Date.now()
      dispatch(updateMainSession(session))
    }
  }

}

export async function getCSRFToken(apiRootUrl: string): Promise<string> {
  const headers = new Headers()

  const result = await fetch(`${apiRootUrl}/generate_csrf/`, {
    method: 'GET',
    mode: 'cors',
    cache: 'default',
    headers,
  })
    .then(response => response.json())
    .then(response => {
      console.log('Success:', JSON.stringify(response))
      return JSON.stringify(response)
    })
    .catch(err => {
      console.log('Something blew up while verifying the API')
      return ''
    })

  return result
}
