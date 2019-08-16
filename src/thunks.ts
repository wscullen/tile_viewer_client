import { Action } from "redux";
import { ThunkAction } from "redux-thunk";
import { sendMessage } from "./store/chat/actions";
import { AppState } from "./store/index";

export const thunkSendMessage = (
  message: string
): ThunkAction<void, AppState, null, Action<string>> => async (dispatch: any) => {
  let asyncResp
  await exampleAPI().then(result => asyncResp = result );

  dispatch(
    sendMessage({
      message,
      user: asyncResp,
      timestamp: new Date().getTime()
    })
  );
};

function exampleAPI(): Promise<string> {
  return new Promise((resolve, reject): void => {
    setTimeout(() => {
      resolve('Success')
    }, 2000)
  })

  // return Promise.resolve("Async Chat Bot");
}
