import { Action } from 'redux'
import { ThunkAction } from 'redux-thunk'
import { updateMainSession, startLogin, finishLogin } from './actions'
import { updateLoginForm } from '../session/actions'
import { AppState } from '../index'

import { MainSessionState, SessionSettings, Token } from './types'

export const thunkUpdateCsrfTokens = (): ThunkAction<void, AppState, null, Action<string>> => async (
  dispatch: any,
  getState: any,
) => {
  console.log('Trying to update the CSRF tokens')

  const state = getState()

  await getCSRFTokens(state.session, dispatch)
}

export const thunkAttemptLogin = ({
  email,
  password,
  url,
}: {
  email: string
  password: string
  url: string
}): ThunkAction<void, AppState, null, Action<string>> => async (dispatch: any, getState: any) => {
  let session = getState().session

  dispatch(startLogin())

  // Create Request body
  const body = JSON.stringify({
    email,
    password,
  })

  const newSettings: SessionSettings = {
    ...session.settings,
    jobManagerUrl: url,
    auth: {
      userEmail: email,
      userPassword: password,
    },
  }

  const result = await fetch(`${url}/api/token/`, {
    method: 'POST',
    mode: 'cors',
    cache: 'default',
    headers: {
      'Content-Type': 'application/json',
    },
    body,
  })
    .then(response => {
      if ([200, 201].includes(response.status)) {
        return response.json()
      } else {
        console.log(response.status)
        newSettings.authenticated = false

        const newLoginFormStatus = {
          success: false,
          finished: true,
          msg: `Unable to reach server (${response.status}`,
          submitting: false,
        }
        console.log('finish login here')
        throw new Error(response.status.toString())
      }
    })
    .then(response => {
      console.log('Success:', JSON.stringify(response))

      const now = Date.now().toString()

      newSettings.auth.accessToken = response.access
      newSettings.auth.refreshToken = response.refresh
      newSettings.auth.dateVerified = now
      newSettings.authenticated = true

      dispatch(finishLogin(newSettings))

      return getApiVersion(url)
    })
    .then(response => {
      const apiObj = JSON.parse(response)

      const newLoginFormStatus = {
        success: true,
        finished: true,
        msg: `Successfully authenticated. (API v${apiObj['version']})`,
        submitting: false,
      }

      dispatch(updateLoginForm(newLoginFormStatus))

      dispatch(finishLogin(newSettings))
      console.log('finish login here')
    })
    .catch(err => {
      console.log('Something blew up while verifying the API')

      let loginResultMsg = ''
      console.log(err)
      if (err.toString() === 'TypeError: Failed to fetch') {
        loginResultMsg = 'Unable to reach server with URL provided.'
      } else if (err.toString() === 'Error: 401') {
        loginResultMsg = 'Not authorized.'
      } else if (err.toString() === 'Error: 404') {
        loginResultMsg = 'Unable to reach server with URL provided.'
      } else if (err.toString() === 'Error: 500') {
        loginResultMsg = 'The server suffered an internal error.'
      }

      const newSettings: SessionSettings = {
        ...session.settings,
        jobManagerUrl: url,
        auth: {
          userEmail: email,
          userPassword: password,
        },
        authenticated: false,
      }

      const newLoginFormStatus = {
        success: false,
        finished: true,
        msg: loginResultMsg,
        submitting: false,
      }

      dispatch(updateLoginForm(newLoginFormStatus))
      dispatch(finishLogin(newSettings))
      return err
    })
}

export const thunkAuthenticate = ({
  email,
  password,
  url,
}: {
  email: string
  password: string
  url: string
}): ThunkAction<void, AppState, null, Action<string>> => async (dispatch: any, getState: any) => {
  console.log('Trying to update the CSRF tokens')

  const state = getState()

  console.log(state)

  let currentSession = state.session

  let tokens = await authenticate({ email, password, url }, dispatch, currentSession)

  console.log(tokens)
}

export async function authenticate(
  {
    email,
    password,
    url,
  }: {
    email: string
    password: string
    url: string
  },
  dispatch: any,
  session: MainSessionState,
) {
  // Create Request body
  const body = JSON.stringify({
    email,
    password,
  })
  try {
    const data = await fetch(`${url}/api/token/`, {
      method: 'POST',
      mode: 'cors',
      cache: 'default',
      headers: {
        'Content-Type': 'application/json',
      },
      body,
    })

    const response = await data.json()

    const refreshResult = await refreshToken(session, dispatch)

    return refreshResult
  } catch {
    return 'BOOM GOES THE DYNAMITE'
  }
  // return fetch(`${url}/api/token/`, {
  //   method: 'POST',
  //   mode: 'cors',
  //   cache: 'default',
  //   headers: {
  //     'Content-Type': 'application/json',
  //   },
  //   body,
  // })
  //   .then(response => response.json())
  //   .then(response => {
  //     console.log('Success:', JSON.stringify(response))

  //     const now = Date.now().toString()
  //     session.settings.jobManagerUrl = url
  //     session.settings.auth.userEmail = email
  //     session.settings.auth.userPassword = password

  //     // Immediately after we login we want to refresh the token
  //     await refreshToken(session, dispatch)
  //     console.log('------------------------------------ first then')
  //   })
  //   .then(response => {
  //     console.log(response)
  //     console.log('------------------------------- second then')
  //     return response
  //   })
  //   .catch(err => {
  //     console.log('Something blew up while verifying the API')
  //     return err
  //   })
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

export async function refreshToken(session: MainSessionState, dispatch: any) {
  // Create Request body
  const body = JSON.stringify({
    refresh: session.settings.auth.refreshToken,
  })

  const result = await fetch(`${session.settings.jobManagerUrl}/api/token/refresh/`, {
    method: 'POST',
    mode: 'cors',
    cache: 'default',
    headers: {
      'Content-Type': 'application/json',
    },
    body,
  })
    .then(response => response.json())
    .then(response => {
      console.log('Success:', JSON.stringify(response))

      const now = Date.now().toString()

      session.settings.auth.accessToken = response.access
      session.settings.auth.dateVerified = now

      dispatch(updateMainSession(session))

      return true
    })
    .catch(err => {
      console.log('Something blew up while trying to refresh the access token')
      return err
    })

  return result
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

export async function getApiVersion(apiRootUrl: string): Promise<string> {
  const headers = new Headers()

  const result = await fetch(`${apiRootUrl}/version/`, {
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
