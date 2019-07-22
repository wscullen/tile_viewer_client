
import { Action, User } from "../types"

import { ADD_USER } from "../actions/user"

function userDataReducer(state: any = { users: [] }, action: Action) {
  switch (action.type) {
    case ADD_USER:
      return Object.assign({}, state,
        {
          users: [...state.users, action.user]
        });
    default:
      return state;
  }
}

export default userDataReducer;