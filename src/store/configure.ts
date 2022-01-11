import { applyMiddleware, compose, createStore, Store } from "redux";
import { composeWithDevTools } from "redux-devtools-extension/developmentOnly";
import storage from "../services/storage";

import createRootReducer, { initialState } from "./reducers";
import type { AppState } from "./types";

/**
 * Configures the redux store to be used for the application.
 */
export default async function configure(): Promise<Store<AppState>> {
  const middlewares = applyMiddleware();
  const persistedStorage = storage();

  const preloadedState: AppState | null = await persistedStorage.readData(
    "state"
  );
  const enhancers =
    typeof window !== undefined
      ? composeWithDevTools(middlewares)
      : compose(middlewares);

  const defaultState = initialState();
  const store = createStore(
    createRootReducer(), // root reducer with router state
    { ...defaultState, ...preloadedState },
    enhancers
  );
  store.subscribe(async () => {
    await persistedStorage.writeData("state", store.getState());
  });
  return store;
}
