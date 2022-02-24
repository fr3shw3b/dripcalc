import { nanoid } from "nanoid";
import {
  CalculatingEarningsAction,
  CALCULATING_EARNINGS,
  EarningsCalculatedAction,
  EARNINGS_CALCULATED,
  FailedCalulatingEarningsAction,
  FAILED_CALCULATING_EARNINGS,
} from "../middleware/calculator-actions";
import {
  REMOVE_NOTIFICATION,
  RemoveNotificationAction,
  SET_NOT_FIRST_TIME,
  SetNotFirstTimeAction,
  ToggleFiatModeAction,
  TOGGLE_FIAT_MODE,
} from "../actions/general";
import { EarningsAndInfo } from "../middleware/shared-calculator-types";
import {
  FetchCurrentNativeDexPriceFailureAction,
  FETCH_CURRENT_NATIVE_DEX_PRICE_FAILURE,
  CalculateCurrentNativeDexPriceFailureAction,
  CALCULATE_CURRENT_NATIVE_DEX_PRICE_IN_CURRENCY_FAILURE,
  CalculateCurrentDripBUSDLPPriceInCurrencyFailureAction,
  CALCULATE_CURRENT_DRIPBUSD_LP_PRICE_IN_CURRENCY_FAILURE,
  FetchCurrentDripBUSDLPPriceFailureAction,
  FETCH_CURRENT_DRIPBUSD_LP_PRICE_FAILURE,
} from "../middleware/price-actions";

export type GeneralState = {
  notifications: Notification[];
  isCalculating: boolean;
  isFirstTime: boolean;
  calculatedEarnings: Record<string, EarningsAndInfo | undefined>;
  fiatMode: boolean;
};

export type Notification = {
  id: string;
  message: string;
  type: "error" | "info" | "warning";
  error?: {
    stack?: string;
  };
};

export function initialState(): GeneralState {
  return {
    notifications: [],
    isCalculating: false,
    isFirstTime: true,
    calculatedEarnings: {},
    fiatMode: false,
  };
}

export type GeneralAction =
  | FailedCalulatingEarningsAction
  | CalculatingEarningsAction
  | EarningsCalculatedAction
  | SetNotFirstTimeAction
  | RemoveNotificationAction
  | FetchCurrentNativeDexPriceFailureAction
  | CalculateCurrentNativeDexPriceFailureAction
  | FetchCurrentDripBUSDLPPriceFailureAction
  | CalculateCurrentDripBUSDLPPriceInCurrencyFailureAction
  | ToggleFiatModeAction;

function reducer(state = initialState(), action: GeneralAction): GeneralState {
  return reducers[action.type]?.(state, action) ?? state;
}

const reducers = {
  [FAILED_CALCULATING_EARNINGS]: (
    state: GeneralState,
    action: GeneralAction
  ): GeneralState => {
    return {
      ...state,
      isCalculating: false,
      notifications: [
        ...state.notifications,
        {
          id: nanoid(),
          message: (action as FailedCalulatingEarningsAction).error.message,
          type: "error",
          error: (action as FailedCalulatingEarningsAction).error,
        },
      ],
    };
  },
  [FETCH_CURRENT_NATIVE_DEX_PRICE_FAILURE]: (
    state: GeneralState,
    action: GeneralAction
  ): GeneralState => {
    return {
      ...state,
      notifications: [
        ...state.notifications,
        {
          id: nanoid(),
          message: (action as FetchCurrentNativeDexPriceFailureAction).error
            .message,
          type: "error",
          error: (action as FetchCurrentNativeDexPriceFailureAction).error,
        },
      ],
    };
  },
  [CALCULATE_CURRENT_NATIVE_DEX_PRICE_IN_CURRENCY_FAILURE]: (
    state: GeneralState,
    action: GeneralAction
  ): GeneralState => {
    return {
      ...state,
      notifications: [
        ...state.notifications,
        {
          id: nanoid(),
          message: (action as CalculateCurrentNativeDexPriceFailureAction).error
            .message,
          type: "error",
          error: (action as CalculateCurrentNativeDexPriceFailureAction).error,
        },
      ],
    };
  },
  [FETCH_CURRENT_DRIPBUSD_LP_PRICE_FAILURE]: (
    state: GeneralState,
    action: GeneralAction
  ): GeneralState => {
    return {
      ...state,
      notifications: [
        ...state.notifications,
        {
          id: nanoid(),
          message: (action as FetchCurrentDripBUSDLPPriceFailureAction).error
            .message,
          type: "error",
          error: (action as FetchCurrentDripBUSDLPPriceFailureAction).error,
        },
      ],
    };
  },
  [CALCULATE_CURRENT_DRIPBUSD_LP_PRICE_IN_CURRENCY_FAILURE]: (
    state: GeneralState,
    action: GeneralAction
  ): GeneralState => {
    return {
      ...state,
      notifications: [
        ...state.notifications,
        {
          id: nanoid(),
          message: (
            action as CalculateCurrentDripBUSDLPPriceInCurrencyFailureAction
          ).error.message,
          type: "error",
          error: (
            action as CalculateCurrentDripBUSDLPPriceInCurrencyFailureAction
          ).error,
        },
      ],
    };
  },
  [CALCULATING_EARNINGS]: (
    state: GeneralState,
    _action: GeneralAction
  ): GeneralState => {
    return {
      ...state,
      isCalculating: true,
    };
  },
  [EARNINGS_CALCULATED]: (
    state: GeneralState,
    action: GeneralAction
  ): GeneralState => {
    const finalAction = action as EarningsCalculatedAction;
    return {
      ...state,
      isCalculating: false,
      calculatedEarnings: {
        ...state.calculatedEarnings,
        [finalAction.payload.planId]: finalAction.payload.earningsAndInfo,
      },
    };
  },
  [REMOVE_NOTIFICATION]: (
    state: GeneralState,
    action: GeneralAction
  ): GeneralState => {
    return {
      ...state,
      notifications: state.notifications.filter(
        ({ id }) => id !== (action as RemoveNotificationAction).payload.id
      ),
    };
  },
  [SET_NOT_FIRST_TIME]: (
    state: GeneralState,
    _action: GeneralAction
  ): GeneralState => {
    return {
      ...state,
      isFirstTime: false,
    };
  },
  [TOGGLE_FIAT_MODE]: (
    state: GeneralState,
    _action: GeneralAction
  ): GeneralState => {
    return {
      ...state,
      fiatMode: !state.fiatMode,
    };
  },
};

export default reducer;
