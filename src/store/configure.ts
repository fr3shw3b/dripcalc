import { applyMiddleware, compose, createStore, Store } from "redux";
import { composeWithDevTools } from "redux-devtools-extension/developmentOnly";
import { config } from "../contexts/config";
import { featureToggles } from "../contexts/feature-toggles";
import storage from "../services/storage";
import createDripCalcApi from "../services/dripcalcapi";
import createDripBUSDConnector from "../services/dripbusd-connector";
import createPancakeSwapApi from "../services/pancakeswap-api";
import { CleanAllDataAction } from "./actions/general";
import calculator from "./middleware/calculator";
import { EARNINGS_CALCULATED } from "./middleware/calculator-actions";
import persistence from "./middleware/persistence";
import price from "./middleware/price";

import createRootReducer, { initialState } from "./reducers";
import { GeneralAction } from "./reducers/general";
import { PlansAction } from "./reducers/plans";
import { SettingsAction } from "./reducers/settings";
import { ViewsAction } from "./reducers/views";
import type { AppState } from "./types";
import Web3 from "web3";
import {
  CALCULATE_CURRENT_DRIPBUSD_LP_PRICE_IN_CURRENCY_SUCCESS,
  CALCULATE_CURRENT_NATIVE_DEX_PRICE_IN_CURRENCY_SUCCESS,
  FETCH_CURRENT_DRIPBUSD_LP_PRICE_SUCCESS,
  FETCH_CURRENT_NATIVE_DEX_PRICE_SUCCESS,
} from "./middleware/price-actions";

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
  const appFeatureToggles = featureToggles();
  const persistedStorage = storage();
  const dripCalcApi = createDripCalcApi({
    baseUrl: appConfig.dripcalcApiBaseUrl,
    refreshExchangeRatesInterval: appConfig.refreshExchangeRatesInterval,
  });
  const pancakeSwapApi = createPancakeSwapApi(appConfig);
  const web3 = new Web3(
    new Web3.providers.HttpProvider(appConfig.bscDataSeedUrl)
  );
  const dripBUSDConnector = createDripBUSDConnector(
    appConfig,
    pancakeSwapApi,
    web3
  );
  const middlewares = applyMiddleware(
    calculator(appConfig, appFeatureToggles),
    persistence(persistedStorage),
    price({
      nativeDexPriceApiBaseUrl: appConfig.nativeDexPriceApiBaseUrl,
      dripCalcApi,
      dripBUSDConnector,
    })
  );

  const preloadedState: AppState | null = await persistedStorage.readData(
    "statev2"
  );

  const composeDevToolsEnhancer = composeWithDevTools({
    // EARNINGS_CALCULATED is huge and a few other actions cause performance issues
    // for deserialising in devtools.
    actionsBlacklist: [
      EARNINGS_CALCULATED,
      FETCH_CURRENT_DRIPBUSD_LP_PRICE_SUCCESS,
      FETCH_CURRENT_NATIVE_DEX_PRICE_SUCCESS,
      CALCULATE_CURRENT_DRIPBUSD_LP_PRICE_IN_CURRENCY_SUCCESS,
      CALCULATE_CURRENT_NATIVE_DEX_PRICE_IN_CURRENCY_SUCCESS,
    ],
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
      settings: { ...defaultState.settings, ...preloadedState?.settings },
    },
    enhancers
  );
  store.subscribe(async () => {
    const { price: _excludePrice, ...stateToPersist } = store.getState();
    await persistedStorage.writeData("statev2", stateToPersist);
  });
  return store;
}
