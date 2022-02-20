import { applyMiddleware, compose, createStore, Store } from "redux";
import { composeWithDevTools } from "redux-devtools-extension/developmentOnly";
import { config } from "../contexts/config";
import storage from "../services/storage";
import { CleanAllDataAction } from "./actions/general";
import calculator from "./middleware/calculator";
import { EARNINGS_CALCULATED } from "./middleware/calculator-actions";
import persistence from "./middleware/persistence";

import createRootReducer, { initialState } from "./reducers";
import { GeneralAction } from "./reducers/general";
import { PlansAction } from "./reducers/plans";
import { SettingsAction } from "./reducers/settings";
import { ViewsAction } from "./reducers/views";
import type { AppState } from "./types";

/**
 * Configures the redux store to be used for the application.
 */
export default async function configure(): Promise<
  Store<
    AppState,
    | SettingsAction
    | GeneralAction
    | PlansAction
    | ViewsAction
    | CleanAllDataAction
  >
> {
  // We can't access the react context API from the redux middleware
  // so we have to load a separate instance of config.
  const appConfig = config();
  const persistedStorage = storage();
  const middlewares = applyMiddleware(
    calculator(appConfig),
    persistence(persistedStorage)
  );

  const preloadedState: AppState | null = await persistedStorage.readData(
    "statev2"
  );

  const composeDevToolsEnhancer = composeWithDevTools({
    // EARNINGS_CALCULATED is huge and causes performance issues
    // for deserialising in devtools.
    actionsBlacklist: [EARNINGS_CALCULATED],
  });

  const enhancers =
    typeof window !== undefined
      ? composeDevToolsEnhancer(middlewares)
      : compose(middlewares);

  const defaultState = initialState();
  const store = createStore(
    createRootReducer(), // root reducer with router state
    {
      ...defaultState,
      ...preloadedState,
      // Make sure any new settings that are added get default values when a user
      // first opens the up with the new features that have been added with new settings!
      settings: { ...preloadedState?.settings, ...defaultState.settings },
    },
    enhancers
  );
  store.subscribe(async () => {
    await persistedStorage.writeData("statev2", store.getState());
  });
  return store;
}
