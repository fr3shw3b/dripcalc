import type { TrendPeriod } from "../../services/token-value-provider";
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
  UpdateHydrateFrequencyAction,
  UPDATE_HYDRATE_FREQUENCY,
  UpdateDripBUSDLPValueTrendAction,
  UpdateDripBUSDLPUptrendMaxValueChangeAction,
  UPDATE_DRIP_BUSD_LP_VALUE_TREND,
  UPDATE_DRIP_BUSD_LP_UPTREND_MAX_VALUE_CHANGE,
  UPDATE_DRIP_BUSD_LP_DOWNTREND_MIN_VALUE_CHANGE,
  UpdateDripBUSDLPDowntrendMinValueChangeAction,
  UPDATE_DRIP_BUSD_LP_STABILISES_AT,
  UpdateDripBUSDLPStabilisesAtAction,
  UPDATE_GARDEN_AVERAGE_SOW_GAS_FEE,
  UpdateGardenAverageSowGasFeeAction,
  UpdateGardenTrendPeriodAction,
  UPDATE_GARDEN_TREND_PERIOD,
  UpdateGardenSowFrequencyAction,
  UPDATE_GARDEN_SOW_FREQUENCY,
  UpdateGardenLastYearAction,
  UPDATE_GARDEN_LAST_YEAR,
  UpdateGardenHarvestmDaysAction,
  UPDATE_GARDEN_HARVEST_DAYS,
  UPDATE_GARDEN_AVERAGE_DEPOSIT_HARVEST_GAS_FEE,
  UpdateGardenAverageDepositHarvestGasFeeAction,
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
  defaultHydrateFrequency: HydrateFrequency;
  dripBUSDLPValueTrend: string;
  dripBUSDLPUptrendMaxValue: number;
  dripBUSDLPDowntrendMinValue: number;
  dripBUSDLPStabilisesAt: number;
  // sowing seeds (<$0.20).
  gardenAverageSowGasFee: number;
  // Average across deposits and harvesting seeds (can be up to $3.50),
  gardenAverageDepositHarvestGasFee: number;
  gardenHarvestDays: string;
  gardenTrendPeriod: TrendPeriod;
  defaultGardenSowFrequency: SowFrequency;
  gardenLastYear: number;
};

export type HydrateFrequency =
  | "everyDay"
  | "everyOtherDay"
  | "everyWeek"
  | "automatic";

export type SowFrequency =
  | "multipleTimesADay"
  | "everyDay"
  | "everyOtherDay"
  | "everyWeek";

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
    defaultHydrateFrequency: "automatic",
    dripBUSDLPValueTrend: "downtrend",
    dripBUSDLPUptrendMaxValue: 100,
    dripBUSDLPDowntrendMinValue: 1,
    dripBUSDLPStabilisesAt: 20,
    gardenAverageSowGasFee: 0.15,
    gardenAverageDepositHarvestGasFee: 3,
    gardenHarvestDays: "startOfMonth",
    gardenTrendPeriod: "tenYears",
    defaultGardenSowFrequency: "multipleTimesADay",
    // Default to 3 years from now!
    gardenLastYear: new Date().getFullYear() + 3,
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
  | UpdateHydrateFrequencyAction
  | UpdateClaimDaysAction
  | UpdateDripBUSDLPValueTrendAction
  | UpdateDripBUSDLPUptrendMaxValueChangeAction
  | UpdateDripBUSDLPDowntrendMinValueChangeAction
  | UpdateDripBUSDLPStabilisesAtAction
  | UpdateGardenAverageSowGasFeeAction
  | UpdateGardenAverageDepositHarvestGasFeeAction
  | UpdateGardenTrendPeriodAction
  | UpdateGardenSowFrequencyAction
  | UpdateGardenHarvestmDaysAction
  | UpdateGardenLastYearAction;

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
  [UPDATE_DRIP_BUSD_LP_VALUE_TREND]: (
    state: SettingsState,
    action: SettingsAction
  ): SettingsState => {
    const finalAction = action as UpdateDripBUSDLPValueTrendAction;
    return {
      ...state,
      [finalAction.payload.planId]: {
        ...state[finalAction.payload.planId],
        dripBUSDLPValueTrend: finalAction.payload.trend,
      },
    };
  },
  [UPDATE_HYDRATE_FREQUENCY]: (
    state: SettingsState,
    action: SettingsAction
  ): SettingsState => {
    const finalAction = action as UpdateHydrateFrequencyAction;
    return {
      ...state,
      [finalAction.payload.planId]: {
        ...state[finalAction.payload.planId],
        defaultHydrateFrequency: finalAction.payload.hydrateFrequency,
      },
    };
  },
  [UPDATE_GARDEN_SOW_FREQUENCY]: (
    state: SettingsState,
    action: SettingsAction
  ): SettingsState => {
    const finalAction = action as UpdateGardenSowFrequencyAction;
    return {
      ...state,
      [finalAction.payload.planId]: {
        ...state[finalAction.payload.planId],
        defaultGardenSowFrequency: finalAction.payload.sowFrequency,
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
        currency: finalAction.payload.currency,
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
  [UPDATE_DRIP_BUSD_LP_UPTREND_MAX_VALUE_CHANGE]: (
    state: SettingsState,
    action: SettingsAction
  ): SettingsState => {
    const finalAction = action as UpdateDripBUSDLPUptrendMaxValueChangeAction;
    return {
      ...state,
      [finalAction.payload.planId]: {
        ...state[finalAction.payload.planId],
        dripBUSDLPUptrendMaxValue: finalAction.payload.value,
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
  [UPDATE_DRIP_BUSD_LP_DOWNTREND_MIN_VALUE_CHANGE]: (
    state: SettingsState,
    action: SettingsAction
  ): SettingsState => {
    const finalAction = action as UpdateDripBUSDLPDowntrendMinValueChangeAction;
    return {
      ...state,
      [finalAction.payload.planId]: {
        ...state[finalAction.payload.planId],
        dripBUSDLPDowntrendMinValue: finalAction.payload.value,
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
  [UPDATE_DRIP_BUSD_LP_STABILISES_AT]: (
    state: SettingsState,
    action: SettingsAction
  ): SettingsState => {
    const finalAction = action as UpdateDripBUSDLPStabilisesAtAction;
    return {
      ...state,
      [finalAction.payload.planId]: {
        ...state[finalAction.payload.planId],
        dripBUSDLPStabilisesAt: finalAction.payload.value,
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
  [UPDATE_GARDEN_AVERAGE_SOW_GAS_FEE]: (
    state: SettingsState,
    action: SettingsAction
  ): SettingsState => {
    const finalAction = action as UpdateGardenAverageSowGasFeeAction;
    return {
      ...state,
      [finalAction.payload.planId]: {
        ...state[finalAction.payload.planId],
        gardenAverageSowGasFee: finalAction.payload.value,
      },
    };
  },
  [UPDATE_GARDEN_AVERAGE_DEPOSIT_HARVEST_GAS_FEE]: (
    state: SettingsState,
    action: SettingsAction
  ): SettingsState => {
    const finalAction = action as UpdateGardenAverageDepositHarvestGasFeeAction;
    return {
      ...state,
      [finalAction.payload.planId]: {
        ...state[finalAction.payload.planId],
        gardenAverageDepositHarvestGasFee: finalAction.payload.value,
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
  [UPDATE_GARDEN_HARVEST_DAYS]: (
    state: SettingsState,
    action: SettingsAction
  ): SettingsState => {
    const finalAction = action as UpdateGardenHarvestmDaysAction;
    return {
      ...state,
      [finalAction.payload.planId]: {
        ...state[finalAction.payload.planId],
        gardenHarvestDays: finalAction.payload.harvestDays,
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
  [UPDATE_GARDEN_TREND_PERIOD]: (
    state: SettingsState,
    action: SettingsAction
  ): SettingsState => {
    const finalAction = action as UpdateGardenTrendPeriodAction;
    return {
      ...state,
      [finalAction.payload.planId]: {
        ...state[finalAction.payload.planId],
        gardenTrendPeriod: finalAction.payload.trendPeriod,
      },
    };
  },
  [UPDATE_GARDEN_LAST_YEAR]: (
    state: SettingsState,
    action: SettingsAction
  ): SettingsState => {
    const finalAction = action as UpdateGardenLastYearAction;
    return {
      ...state,
      [finalAction.payload.planId]: {
        ...state[finalAction.payload.planId],
        gardenLastYear: finalAction.payload.lastYear,
      },
    };
  },
};

export default reducer;
