import {
  FetchCurrentNativeDexPriceSuccessAction,
  FETCH_CURRENT_NATIVE_DEX_PRICE_SUCCESS,
  CalculateCurrentNativeDexPriceInCurrencySuccessAction,
  CALCULATE_CURRENT_NATIVE_DEX_PRICE_IN_CURRENCY_SUCCESS,
  FetchCurrentDripBUSDLPPriceSuccessAction,
  CalculateCurrentDripBUSDLPPriceInCurrencySuccessAction,
  FETCH_CURRENT_DRIPBUSD_LP_PRICE_SUCCESS,
  CALCULATE_CURRENT_DRIPBUSD_LP_PRICE_IN_CURRENCY_SUCCESS,
} from "../middleware/price-actions";

export type PriceState = {
  nativeDexDripPriceUSDT: number;
  // The user's chosen fiat currency!
  nativeDexDripPriceInCurrency: number;
  dripBUSDLPPriceUSD: number;
  // The user's chosen fiat currency!
  dripBUSDLPPriceInCurrency: number;
};

export function initialState(): PriceState {
  return {
    nativeDexDripPriceUSDT: 0,
    nativeDexDripPriceInCurrency: 0,
    dripBUSDLPPriceUSD: 0,
    dripBUSDLPPriceInCurrency: 0,
  };
}

export type PriceAction =
  | FetchCurrentNativeDexPriceSuccessAction
  | CalculateCurrentNativeDexPriceInCurrencySuccessAction
  | FetchCurrentDripBUSDLPPriceSuccessAction
  | CalculateCurrentDripBUSDLPPriceInCurrencySuccessAction;

function reducer(state = initialState(), action: PriceAction): PriceState {
  return reducers[action.type]?.(state, action) ?? state;
}

const reducers = {
  [FETCH_CURRENT_NATIVE_DEX_PRICE_SUCCESS]: (
    state: PriceState,
    action: PriceAction
  ): PriceState => {
    return {
      ...state,
      nativeDexDripPriceUSDT: (
        action as FetchCurrentNativeDexPriceSuccessAction
      ).payload.currentPrice,
    };
  },
  [CALCULATE_CURRENT_NATIVE_DEX_PRICE_IN_CURRENCY_SUCCESS]: (
    state: PriceState,
    action: PriceAction
  ): PriceState => {
    return {
      ...state,
      nativeDexDripPriceInCurrency: (
        action as CalculateCurrentNativeDexPriceInCurrencySuccessAction
      ).payload.currentPrice,
    };
  },
  [FETCH_CURRENT_DRIPBUSD_LP_PRICE_SUCCESS]: (
    state: PriceState,
    action: PriceAction
  ): PriceState => {
    return {
      ...state,
      dripBUSDLPPriceUSD: (action as FetchCurrentDripBUSDLPPriceSuccessAction)
        .payload.currentPrice,
    };
  },
  [CALCULATE_CURRENT_DRIPBUSD_LP_PRICE_IN_CURRENCY_SUCCESS]: (
    state: PriceState,
    action: PriceAction
  ): PriceState => {
    return {
      ...state,
      dripBUSDLPPriceInCurrency: (
        action as CalculateCurrentDripBUSDLPPriceInCurrencySuccessAction
      ).payload.currentPrice,
    };
  },
};

export default reducer;
