import {
  UpdateCurrencyAction,
  UpdateDripValueTrendAction,
  UPDATE_CURRENCY,
  UPDATE_DRIP_VALUE_TREND,
  UPDATE_UPTREND_MAX_VALUE_CHANGE,
  UpdateUptrendMaxValueChangeAction,
  UPDATE_DOWNTREND_MIN_VALUE_CHANGE,
  UpdateDowntrendMinValueChangeAction,
  UPDATE_STABILISES_AT,
  UpdateStabilisesAtAction,
  UPDATE_AVERAGE_GAS_FEE,
  UpdateAverageGasFeeAction,
  UpdateClaimDaysAction,
  UPDATE_CLAIM_DAYS,
} from "../actions/settings";

export type SettingsState = {
  dripValueTrend: string;
  uptrendMaxValue: number;
  downtrendMinValue: number;
  stabilisesAt: number;
  currency: "$" | "£" | "€";
  averageGasFee: number;
  claimDays: string;
};

export function initialState(): SettingsState {
  return {
    dripValueTrend: "stable",
    uptrendMaxValue: 1000,
    downtrendMinValue: 1,
    stabilisesAt: 50,
    currency: "£",
    claimDays: "startOfMonth",
    averageGasFee: 1,
  };
}

type SettingsAction =
  | UpdateDripValueTrendAction
  | UpdateCurrencyAction
  | UpdateUptrendMaxValueChangeAction
  | UpdateDowntrendMinValueChangeAction
  | UpdateStabilisesAtAction
  | UpdateAverageGasFeeAction
  | UpdateClaimDaysAction;

function reducer(
  state = initialState(),
  action: SettingsAction
): SettingsState {
  return reducers[action.type]?.(state, action) ?? state;
}

const reducers = {
  [UPDATE_DRIP_VALUE_TREND]: (
    state: SettingsState,
    action: SettingsAction
  ): SettingsState => {
    return {
      ...state,
      dripValueTrend: (action as UpdateDripValueTrendAction).trend,
    };
  },
  [UPDATE_CURRENCY]: (
    state: SettingsState,
    action: SettingsAction
  ): SettingsState => {
    return {
      ...state,
      currency: (action as UpdateCurrencyAction).currency,
    };
  },
  [UPDATE_UPTREND_MAX_VALUE_CHANGE]: (
    state: SettingsState,
    action: SettingsAction
  ): SettingsState => {
    return {
      ...state,
      uptrendMaxValue: (action as UpdateUptrendMaxValueChangeAction).value,
    };
  },
  [UPDATE_DOWNTREND_MIN_VALUE_CHANGE]: (
    state: SettingsState,
    action: SettingsAction
  ): SettingsState => {
    return {
      ...state,
      downtrendMinValue: (action as UpdateDowntrendMinValueChangeAction).value,
    };
  },
  [UPDATE_STABILISES_AT]: (
    state: SettingsState,
    action: SettingsAction
  ): SettingsState => {
    return {
      ...state,
      stabilisesAt: (action as UpdateStabilisesAtAction).value,
    };
  },
  [UPDATE_AVERAGE_GAS_FEE]: (
    state: SettingsState,
    action: SettingsAction
  ): SettingsState => {
    return {
      ...state,
      averageGasFee: (action as UpdateAverageGasFeeAction).value,
    };
  },
  [UPDATE_CLAIM_DAYS]: (
    state: SettingsState,
    action: SettingsAction
  ): SettingsState => {
    return {
      ...state,
      claimDays: (action as UpdateClaimDaysAction).claimDays,
    };
  },
};

export default reducer;
