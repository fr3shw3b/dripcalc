import { applyMiddleware, compose, createStore, Store } from "redux";
import { composeWithDevTools } from "redux-devtools-extension/developmentOnly";
import { config } from "../contexts/config";
import storage from "../services/storage";
import calculator from "./middleware/calculator";

import createRootReducer, { initialState } from "./reducers";
import type { AppState } from "./types";

/**
 * Configures the redux store to be used for the application.
 */
export default async function configure(): Promise<Store<AppState>> {
  // We can't access the react context API from the redux middleware
  // so we have to load a separate instance of config.
  const appConfig = config();
  const middlewares = applyMiddleware(calculator(appConfig));
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
