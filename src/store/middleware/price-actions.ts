import type { FSA } from "../types";

export const FETCH_CURRENT_NATIVE_DEX_PRICE_SUCCESS =
  "FETCH_CURRENT_NATIVE_DEX_PRICE_SUCCESS";
export type FetchCurrentNativeDexPriceSuccessAction = FSA<
  typeof FETCH_CURRENT_NATIVE_DEX_PRICE_SUCCESS,
  Record<string, unknown>,
  {
    currentPrice: number;
  }
>;

export function fetchCurrentNativeDexPriceSuccess(
  currentPrice: number
): FetchCurrentNativeDexPriceSuccessAction {
  return {
    type: FETCH_CURRENT_NATIVE_DEX_PRICE_SUCCESS,
    payload: {
      currentPrice,
    },
    meta: {},
  };
}

export const FETCH_CURRENT_NATIVE_DEX_PRICE_FAILURE =
  "FETCH_CURRENT_NATIVE_DEX_PRICE_FAILURE";
export type FetchCurrentNativeDexPriceFailureAction = FSA<
  typeof FETCH_CURRENT_NATIVE_DEX_PRICE_FAILURE,
  Record<string, unknown>,
  {}
> & { error: { message: string; stack?: string } };
export function fetchCurrentNativeDexPriceFailure(
  error: Error
): FetchCurrentNativeDexPriceFailureAction {
  return {
    type: FETCH_CURRENT_NATIVE_DEX_PRICE_FAILURE,
    error: { message: error.message, stack: error.stack },
    payload: {},
    meta: {},
  };
}

export const CALCULATE_CURRENT_NATIVE_DEX_PRICE_IN_CURRENCY_SUCCESS =
  "CALCULATE_CURRENT_NATIVE_DEX_PRICE_IN_CURRENCY_SUCCESS";
export type CalculateCurrentNativeDexPriceInCurrencySuccessAction = FSA<
  typeof CALCULATE_CURRENT_NATIVE_DEX_PRICE_IN_CURRENCY_SUCCESS,
  Record<string, unknown>,
  {
    currentPrice: number;
  }
>;

export function calculateNativeDexPriceInCurrencySuccess(
  currentPrice: number
): CalculateCurrentNativeDexPriceInCurrencySuccessAction {
  return {
    type: CALCULATE_CURRENT_NATIVE_DEX_PRICE_IN_CURRENCY_SUCCESS,
    payload: {
      currentPrice,
    },
    meta: {},
  };
}

export const CALCULATE_CURRENT_NATIVE_DEX_PRICE_IN_CURRENCY_FAILURE =
  "CALCULATE_CURRENT_NATIVE_DEX_PRICE_IN_CURRENCY_FAILURE";
export type CalculateCurrentNativeDexPriceFailureAction = FSA<
  typeof CALCULATE_CURRENT_NATIVE_DEX_PRICE_IN_CURRENCY_FAILURE,
  Record<string, unknown>,
  {}
> & { error: { message: string; stack?: string } };
export function calculateNativeDexPriceInCurrencyFailure(
  error: Error
): CalculateCurrentNativeDexPriceFailureAction {
  return {
    type: CALCULATE_CURRENT_NATIVE_DEX_PRICE_IN_CURRENCY_FAILURE,
    error: { message: error.message, stack: error.stack },
    payload: {},
    meta: {},
  };
}

export const FETCH_CURRENT_DRIPBUSD_LP_PRICE_SUCCESS =
  "FETCH_CURRENT_DRIPBUSD_LP_PRICE_SUCCESS";
export type FetchCurrentDripBUSDLPPriceSuccessAction = FSA<
  typeof FETCH_CURRENT_DRIPBUSD_LP_PRICE_SUCCESS,
  Record<string, unknown>,
  {
    currentPrice: number;
  }
>;

export function fetchCurrentDripBUSDLPPriceSuccess(
  currentPrice: number
): FetchCurrentDripBUSDLPPriceSuccessAction {
  return {
    type: FETCH_CURRENT_DRIPBUSD_LP_PRICE_SUCCESS,
    payload: {
      currentPrice,
    },
    meta: {},
  };
}

export const FETCH_CURRENT_DRIPBUSD_LP_PRICE_FAILURE =
  "FETCH_CURRENT_DRIPBUSD_LP_PRICE_FAILURE";
export type FetchCurrentDripBUSDLPPriceFailureAction = FSA<
  typeof FETCH_CURRENT_DRIPBUSD_LP_PRICE_FAILURE,
  Record<string, unknown>,
  {}
> & { error: { message: string; stack?: string } };
export function fetchCurrentDripBUSDLPPriceFailure(
  error: Error
): FetchCurrentDripBUSDLPPriceFailureAction {
  return {
    type: FETCH_CURRENT_DRIPBUSD_LP_PRICE_FAILURE,
    error: { message: error.message, stack: error.stack },
    payload: {},
    meta: {},
  };
}

export const CALCULATE_CURRENT_DRIPBUSD_LP_PRICE_IN_CURRENCY_SUCCESS =
  "CALCULATE_CURRENT_DRIPBUSD_LP_PRICE_IN_CURRENCY_SUCCESS";
export type CalculateCurrentDripBUSDLPPriceInCurrencySuccessAction = FSA<
  typeof CALCULATE_CURRENT_DRIPBUSD_LP_PRICE_IN_CURRENCY_SUCCESS,
  Record<string, unknown>,
  {
    currentPrice: number;
  }
>;

export function calculateDripBUSDLPPriceInCurrencySuccess(
  currentPrice: number
): CalculateCurrentDripBUSDLPPriceInCurrencySuccessAction {
  return {
    type: CALCULATE_CURRENT_DRIPBUSD_LP_PRICE_IN_CURRENCY_SUCCESS,
    payload: {
      currentPrice,
    },
    meta: {},
  };
}

export const CALCULATE_CURRENT_DRIPBUSD_LP_PRICE_IN_CURRENCY_FAILURE =
  "CALCULATE_CURRENT_DRIPBUSD_LP_PRICE_IN_CURRENCY_FAILURE";
export type CalculateCurrentDripBUSDLPPriceInCurrencyFailureAction = FSA<
  typeof CALCULATE_CURRENT_DRIPBUSD_LP_PRICE_IN_CURRENCY_FAILURE,
  Record<string, unknown>,
  {}
> & { error: { message: string; stack?: string } };
export function calculateDripBUSDLPPriceInCurrencyFailure(
  error: Error
): CalculateCurrentDripBUSDLPPriceInCurrencyFailureAction {
  return {
    type: CALCULATE_CURRENT_DRIPBUSD_LP_PRICE_IN_CURRENCY_FAILURE,
    error: { message: error.message, stack: error.stack },
    payload: {},
    meta: {},
  };
}
