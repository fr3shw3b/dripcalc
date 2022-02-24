import type { MiddlewareAPI, Dispatch, AnyAction } from "redux";
import { DripBUSDConnector } from "../../services/dripbusd-connector";
import { DripCalcApi } from "../../services/dripcalcapi";

import type { AppState, FSA, MiddlewareFunction } from "../types";
import {
  calculateNativeDexPriceInCurrencyFailure,
  calculateNativeDexPriceInCurrencySuccess,
  fetchCurrentNativeDexPriceFailure,
  fetchCurrentNativeDexPriceSuccess,
  calculateDripBUSDLPPriceInCurrencySuccess,
  calculateDripBUSDLPPriceInCurrencyFailure,
  fetchCurrentDripBUSDLPPriceFailure,
  fetchCurrentDripBUSDLPPriceSuccess,
} from "./price-actions";

type ActionWithPriceSupport<T extends unknown> = FSA<
  T,
  {
    price: {
      refreshDripNativeDexPrice: boolean;
      refreshOnInterval?: number;
      refreshDripBUSDLPPrice: boolean;
    };
  },
  Record<string, unknown>
>;

type PriceConfig = {
  nativeDexPriceApiBaseUrl: string;
  dripCalcApi: DripCalcApi;
  dripBUSDConnector: DripBUSDConnector;
};

function price<State extends AppState = AppState>({
  nativeDexPriceApiBaseUrl,
  dripCalcApi,
  dripBUSDConnector,
}: PriceConfig): MiddlewareFunction {
  return (store: MiddlewareAPI<Dispatch<AnyAction>, State>) =>
    (next: Dispatch<AnyAction>) =>
    (action: AnyAction) => {
      if (supportsPrice(action)) {
        if (action.meta.price.refreshDripNativeDexPrice) {
          fetchPrices(nativeDexPriceApiBaseUrl, store, dripCalcApi);

          if (action.meta.price.refreshOnInterval) {
            setInterval(
              () => fetchPrices(nativeDexPriceApiBaseUrl, store, dripCalcApi),
              action.meta.price.refreshOnInterval
            );
          }
        }

        if (action.meta.price.refreshDripBUSDLPPrice) {
          fetchDripBUSDPrices(dripBUSDConnector, store, dripCalcApi);

          if (action.meta.price.refreshOnInterval) {
            setInterval(
              () => fetchDripBUSDPrices(dripBUSDConnector, store, dripCalcApi),
              action.meta.price.refreshOnInterval
            );
          }
        }
      }
      next(action);
    };
}

async function fetchPrices<State extends AppState>(
  nativeDexPriceApiBaseUrl: string,
  store: MiddlewareAPI<Dispatch<AnyAction>, State>,
  dripCalcApi: DripCalcApi
): Promise<void> {
  let currentPrice: number;
  try {
    currentPrice = await fetchNativeDexCurrentPrice(nativeDexPriceApiBaseUrl);
    store.dispatch(fetchCurrentNativeDexPriceSuccess(currentPrice));

    try {
      const exchangeRates = await dripCalcApi.getExchangeRates();
      const currentPlanId = store.getState().plans.current;
      const currencyCode = getCurrencyCode(
        store.getState().settings[currentPlanId].currency
      );

      if (currencyCode === "USD") {
        store.dispatch(calculateNativeDexPriceInCurrencySuccess(currentPrice));
        return;
      }
      const rateAgainstUSD = exchangeRates.rates[currencyCode];
      store.dispatch(
        calculateNativeDexPriceInCurrencySuccess(currentPrice * rateAgainstUSD)
      );
    } catch (err) {
      store.dispatch(calculateNativeDexPriceInCurrencyFailure(err as Error));
    }
  } catch (err) {
    store.dispatch(fetchCurrentNativeDexPriceFailure(err as Error));
  }
}

type NativePriceData = {
  time: number;
  value: number;
};

async function fetchNativeDexCurrentPrice(apiBaseUrl: string): Promise<number> {
  const response = await fetch(`${apiBaseUrl}/prices`);
  const data: NativePriceData[] = await response.json();

  return data.length > 0 ? data[data.length - 1].value : 0;
}

async function fetchDripBUSDPrices<State extends AppState>(
  dripBUSDConnector: DripBUSDConnector,
  store: MiddlewareAPI<Dispatch<AnyAction>, State>,
  dripCalcApi: DripCalcApi
): Promise<void> {
  let currentPrice: number;
  try {
    currentPrice = await dripBUSDConnector.getDripBUSDLPPrice();
    store.dispatch(fetchCurrentDripBUSDLPPriceSuccess(currentPrice));

    try {
      const exchangeRates = await dripCalcApi.getExchangeRates();
      const currentPlanId = store.getState().plans.current;
      const currencyCode = getCurrencyCode(
        store.getState().settings[currentPlanId].currency
      );

      if (currencyCode === "USD") {
        store.dispatch(calculateDripBUSDLPPriceInCurrencySuccess(currentPrice));
        return;
      }
      const rateAgainstUSD = exchangeRates.rates[currencyCode];
      store.dispatch(
        calculateDripBUSDLPPriceInCurrencySuccess(currentPrice * rateAgainstUSD)
      );
    } catch (err) {
      store.dispatch(calculateDripBUSDLPPriceInCurrencyFailure(err as Error));
    }
  } catch (err) {
    store.dispatch(fetchCurrentDripBUSDLPPriceFailure(err as Error));
  }
}

function supportsPrice<ActionType>(
  action: AnyAction
): action is ActionWithPriceSupport<ActionType> {
  return !!action.meta?.price;
}

function getCurrencyCode(currency: "$" | "£" | "€"): string {
  return currencyCodes[currency];
}

const currencyCodes = {
  $: "USD",
  "£": "GBP",
  "€": "EUR",
};

export default price;
