import type { TrendPeriod } from "../../services/drip-value-provider";
import { SelectPlanAction, SELECT_PLAN } from "../actions/plans";
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
  UPDATE_TREND_PERIOD,
  UpdateTrendPeriodAction,
} from "../actions/settings";

export type SettingsState = Record<string, PlanSettings>;

export type PlanSettings = {
  dripValueTrend: string;
  uptrendMaxValue: number;
  downtrendMinValue: number;
  stabilisesAt: number;
  currency: "$" | "£" | "€";
  averageGasFee: number;
  claimDays: string;
  trendPeriod: TrendPeriod;
};

export function initialState(): SettingsState {
  return {
    "default-plan": createDefaultSettings(),
  };
}

function createDefaultSettings(): PlanSettings {
  return {
    dripValueTrend: "stable",
    uptrendMaxValue: 1000,
    downtrendMinValue: 1,
    stabilisesAt: 50,
    currency: "£",
    claimDays: "startOfMonth",
    averageGasFee: 1,
    trendPeriod: "tenYears",
  };
}

export type SettingsAction =
  | SelectPlanAction
  | UpdateDripValueTrendAction
  | UpdateCurrencyAction
  | UpdateUptrendMaxValueChangeAction
  | UpdateDowntrendMinValueChangeAction
  | UpdateStabilisesAtAction
  | UpdateAverageGasFeeAction
  | UpdateTrendPeriodAction
  | UpdateClaimDaysAction;

function reducer(
  state = initialState(),
  action: SettingsAction
): SettingsState {
  return reducers[action.type]?.(state, action) ?? state;
}

const reducers = {
  [SELECT_PLAN]: (
    state: SettingsState,
    action: SettingsAction
  ): SettingsState => {
    const finalAction = action as SelectPlanAction;
    if (state[finalAction.payload.id]) {
      return state;
    }

    return {
      ...state,
      [finalAction.payload.id]: createDefaultSettings(),
    };
  },
  [UPDATE_DRIP_VALUE_TREND]: (
    state: SettingsState,
    action: SettingsAction
  ): SettingsState => {
    const finalAction = action as UpdateDripValueTrendAction;
    return {
      ...state,
      [finalAction.payload.planId]: {
        ...state[finalAction.payload.planId],
        dripValueTrend: finalAction.payload.trend,
      },
    };
  },
  [UPDATE_CURRENCY]: (
    state: SettingsState,
    action: SettingsAction
  ): SettingsState => {
    const finalAction = action as UpdateCurrencyAction;
    return {
      ...state,
      [finalAction.payload.planId]: {
        ...state[finalAction.payload.planId],
        dripValueTrend: finalAction.payload.currency,
      },
    };
  },
  [UPDATE_UPTREND_MAX_VALUE_CHANGE]: (
    state: SettingsState,
    action: SettingsAction
  ): SettingsState => {
    const finalAction = action as UpdateUptrendMaxValueChangeAction;
    return {
      ...state,
      [finalAction.payload.planId]: {
        ...state[finalAction.payload.planId],
        uptrendMaxValue: finalAction.payload.value,
      },
    };
  },
  [UPDATE_DOWNTREND_MIN_VALUE_CHANGE]: (
    state: SettingsState,
    action: SettingsAction
  ): SettingsState => {
    const finalAction = action as UpdateDowntrendMinValueChangeAction;
    return {
      ...state,
      [finalAction.payload.planId]: {
        ...state[finalAction.payload.planId],
        downtrendMinValue: finalAction.payload.value,
      },
    };
  },
  [UPDATE_STABILISES_AT]: (
    state: SettingsState,
    action: SettingsAction
  ): SettingsState => {
    const finalAction = action as UpdateStabilisesAtAction;
    return {
      ...state,
      [finalAction.payload.planId]: {
        ...state[finalAction.payload.planId],
        stabilisesAt: finalAction.payload.value,
      },
    };
  },
  [UPDATE_AVERAGE_GAS_FEE]: (
    state: SettingsState,
    action: SettingsAction
  ): SettingsState => {
    const finalAction = action as UpdateAverageGasFeeAction;
    return {
      ...state,
      [finalAction.payload.planId]: {
        ...state[finalAction.payload.planId],
        averageGasFee: finalAction.payload.value,
      },
    };
  },
  [UPDATE_CLAIM_DAYS]: (
    state: SettingsState,
    action: SettingsAction
  ): SettingsState => {
    const finalAction = action as UpdateClaimDaysAction;
    return {
      ...state,
      [finalAction.payload.planId]: {
        ...state[finalAction.payload.planId],
        claimDays: finalAction.payload.claimDays,
      },
    };
  },
  [UPDATE_TREND_PERIOD]: (
    state: SettingsState,
    action: SettingsAction
  ): SettingsState => {
    const finalAction = action as UpdateTrendPeriodAction;
    return {
      ...state,
      [finalAction.payload.planId]: {
        ...state[finalAction.payload.planId],
        trendPeriod: finalAction.payload.trendPeriod,
      },
    };
  },
};

export default reducer;
