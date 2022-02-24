import type { TrendPeriod } from "../../services/token-value-provider";
import { CalculationSet } from "../middleware/calculator";
import { HydrateFrequency, SowFrequency } from "../reducers/settings";
import type { FSA } from "../types";

type CalculatorMeta = {
  calculator: {
    recalculate: boolean;
    set: CalculationSet;
  };
};

export const UPDATE_DRIP_VALUE_TREND = "UPDATE_DRIP_VALUE_TREND";
export type UpdateDripValueTrendAction = FSA<
  typeof UPDATE_DRIP_VALUE_TREND,
  CalculatorMeta,
  {
    trend: string;
    planId: string;
  }
>;

export function updateDripValueTrend(
  trend: string,
  planId: string
): UpdateDripValueTrendAction {
  return {
    type: UPDATE_DRIP_VALUE_TREND,
    payload: {
      trend,
      planId,
    },
    meta: {
      calculator: {
        recalculate: true,
        set: "faucet",
      },
    },
  };
}

export const UPDATE_DRIP_BUSD_LP_VALUE_TREND =
  "UPDATE_DRIP_BUSD_LP_VALUE_TREND";
export type UpdateDripBUSDLPValueTrendAction = FSA<
  typeof UPDATE_DRIP_BUSD_LP_VALUE_TREND,
  CalculatorMeta,
  {
    trend: string;
    planId: string;
  }
>;

export function updateDripBUSDLPValueTrend(
  trend: string,
  planId: string
): UpdateDripBUSDLPValueTrendAction {
  return {
    type: UPDATE_DRIP_BUSD_LP_VALUE_TREND,
    payload: {
      trend,
      planId,
    },
    meta: {
      calculator: {
        recalculate: true,
        set: "garden",
      },
    },
  };
}

export const UPDATE_CURRENCY = "UPDATE_CURRENCY";
export type UpdateCurrencyAction = FSA<
  typeof UPDATE_CURRENCY,
  {
    price: {
      refreshDripNativeDexPrice: boolean;
      refreshDripBUSDLPPrice: boolean;
    };
  },
  {
    currency: "$" | "£" | "€";
    planId: string;
  }
>;

export function updateCurrency(
  currency: "$" | "£" | "€",
  planId: string
): UpdateCurrencyAction {
  return {
    type: UPDATE_CURRENCY,
    payload: {
      currency,
      planId,
    },
    meta: {
      price: {
        refreshDripNativeDexPrice: true,
        refreshDripBUSDLPPrice: true,
      },
    },
  };
}

export const UPDATE_UPTREND_MAX_VALUE_CHANGE =
  "UPDATE_UPTREND_MAX_VALUE_CHANGE";
export type UpdateUptrendMaxValueChangeAction = FSA<
  typeof UPDATE_UPTREND_MAX_VALUE_CHANGE,
  CalculatorMeta,
  {
    value: number;
    planId: string;
  }
>;

export function updateUptrendMaxValueChange(
  value: number,
  planId: string
): UpdateUptrendMaxValueChangeAction {
  return {
    type: UPDATE_UPTREND_MAX_VALUE_CHANGE,
    payload: {
      value,
      planId,
    },
    meta: {
      calculator: {
        recalculate: true,
        set: "faucet",
      },
    },
  };
}

export const UPDATE_DRIP_BUSD_LP_UPTREND_MAX_VALUE_CHANGE =
  "UPDATE_DRIP_BUSD_LP_UPTREND_MAX_VALUE_CHANGE";
export type UpdateDripBUSDLPUptrendMaxValueChangeAction = FSA<
  typeof UPDATE_DRIP_BUSD_LP_UPTREND_MAX_VALUE_CHANGE,
  CalculatorMeta,
  {
    value: number;
    planId: string;
  }
>;

export function updateDripBUSDLPUptrendMaxValueChange(
  value: number,
  planId: string
): UpdateDripBUSDLPUptrendMaxValueChangeAction {
  return {
    type: UPDATE_DRIP_BUSD_LP_UPTREND_MAX_VALUE_CHANGE,
    payload: {
      value,
      planId,
    },
    meta: {
      calculator: {
        recalculate: true,
        set: "garden",
      },
    },
  };
}

export const UPDATE_DOWNTREND_MIN_VALUE_CHANGE =
  "UPDATE_DOWNTREND_MIN_VALUE_CHANGE";
export type UpdateDowntrendMinValueChangeAction = FSA<
  typeof UPDATE_DOWNTREND_MIN_VALUE_CHANGE,
  CalculatorMeta,
  {
    value: number;
    planId: string;
  }
>;

export function updateDowntrendMinValueChange(
  value: number,
  planId: string
): UpdateDowntrendMinValueChangeAction {
  return {
    type: UPDATE_DOWNTREND_MIN_VALUE_CHANGE,
    payload: {
      value,
      planId,
    },
    meta: {
      calculator: {
        recalculate: true,
        set: "faucet",
      },
    },
  };
}

export const UPDATE_DRIP_BUSD_LP_DOWNTREND_MIN_VALUE_CHANGE =
  "UPDATE_DRIP_BUSD_LP_DOWNTREND_MIN_VALUE_CHANGE";
export type UpdateDripBUSDLPDowntrendMinValueChangeAction = FSA<
  typeof UPDATE_DRIP_BUSD_LP_DOWNTREND_MIN_VALUE_CHANGE,
  CalculatorMeta,
  {
    value: number;
    planId: string;
  }
>;

export function updateDripBUSDLPDowntrendMinValueChange(
  value: number,
  planId: string
): UpdateDripBUSDLPDowntrendMinValueChangeAction {
  return {
    type: UPDATE_DRIP_BUSD_LP_DOWNTREND_MIN_VALUE_CHANGE,
    payload: {
      value,
      planId,
    },
    meta: {
      calculator: {
        recalculate: true,
        set: "garden",
      },
    },
  };
}

export const UPDATE_STABILISES_AT = "UPDATE_STABILISES_AT";
export type UpdateStabilisesAtAction = FSA<
  typeof UPDATE_STABILISES_AT,
  CalculatorMeta,
  {
    value: number;
    planId: string;
  }
>;

export function updateStabilisesAt(
  value: number,
  planId: string
): UpdateStabilisesAtAction {
  return {
    type: UPDATE_STABILISES_AT,
    payload: {
      value,
      planId,
    },
    meta: {
      calculator: {
        recalculate: true,
        set: "faucet",
      },
    },
  };
}

export const UPDATE_DRIP_BUSD_LP_STABILISES_AT =
  "UPDATE_DRIP_BUSD_LP_STABILISES_AT";
export type UpdateDripBUSDLPStabilisesAtAction = FSA<
  typeof UPDATE_DRIP_BUSD_LP_STABILISES_AT,
  CalculatorMeta,
  {
    value: number;
    planId: string;
  }
>;

export function updateDripBUSDLPStabilisesAt(
  value: number,
  planId: string
): UpdateDripBUSDLPStabilisesAtAction {
  return {
    type: UPDATE_DRIP_BUSD_LP_STABILISES_AT,
    payload: {
      value,
      planId,
    },
    meta: {
      calculator: {
        recalculate: true,
        set: "garden",
      },
    },
  };
}

export const UPDATE_AVERAGE_GAS_FEE = "UPDATE_AVERAGE_GAS_FEE";
export type UpdateAverageGasFeeAction = FSA<
  typeof UPDATE_AVERAGE_GAS_FEE,
  CalculatorMeta,
  {
    value: number;
    planId: string;
  }
>;

export function updateAverageGasFee(
  value: number,
  planId: string
): UpdateAverageGasFeeAction {
  return {
    type: UPDATE_AVERAGE_GAS_FEE,
    payload: {
      value,
      planId,
    },
    meta: {
      calculator: {
        recalculate: true,
        set: "faucet",
      },
    },
  };
}

export const UPDATE_GARDEN_AVERAGE_SOW_GAS_FEE =
  "UPDATE_GARDEN_AVERAGE_SOW_GAS_FEE";
export type UpdateGardenAverageSowGasFeeAction = FSA<
  typeof UPDATE_GARDEN_AVERAGE_SOW_GAS_FEE,
  CalculatorMeta,
  {
    value: number;
    planId: string;
  }
>;

export function updateGardenAverageSowGasFee(
  value: number,
  planId: string
): UpdateGardenAverageSowGasFeeAction {
  return {
    type: UPDATE_GARDEN_AVERAGE_SOW_GAS_FEE,
    payload: {
      value,
      planId,
    },
    meta: {
      calculator: {
        recalculate: true,
        set: "garden",
      },
    },
  };
}

export const UPDATE_GARDEN_AVERAGE_DEPOSIT_HARVEST_GAS_FEE =
  "UPDATE_GARDEN_AVERAGE_DEPOSIT_HARVEST_GAS_FEE";
export type UpdateGardenAverageDepositHarvestGasFeeAction = FSA<
  typeof UPDATE_GARDEN_AVERAGE_DEPOSIT_HARVEST_GAS_FEE,
  CalculatorMeta,
  {
    value: number;
    planId: string;
  }
>;

export function updateGardenAverageDepositHarvestGasFee(
  value: number,
  planId: string
): UpdateGardenAverageDepositHarvestGasFeeAction {
  return {
    type: UPDATE_GARDEN_AVERAGE_DEPOSIT_HARVEST_GAS_FEE,
    payload: {
      value,
      planId,
    },
    meta: {
      calculator: {
        recalculate: true,
        set: "garden",
      },
    },
  };
}

export const UPDATE_CLAIM_DAYS = "UPDATE_CLAIM_DAYS";
export type UpdateClaimDaysAction = FSA<
  typeof UPDATE_CLAIM_DAYS,
  CalculatorMeta,
  {
    claimDays: string;
    planId: string;
  }
>;

export function updateClaimDays(
  claimDays: string,
  planId: string
): UpdateClaimDaysAction {
  return {
    type: UPDATE_CLAIM_DAYS,
    payload: {
      claimDays,
      planId,
    },
    meta: {
      calculator: {
        recalculate: true,
        set: "faucet",
      },
    },
  };
}

export const UPDATE_GARDEN_HARVEST_DAYS = "UPDATE_GARDEN_HARVEST_DAYS";
export type UpdateGardenHarvestmDaysAction = FSA<
  typeof UPDATE_GARDEN_HARVEST_DAYS,
  CalculatorMeta,
  {
    harvestDays: string;
    planId: string;
  }
>;

export function updateGardenHarvestDays(
  harvestDays: string,
  planId: string
): UpdateGardenHarvestmDaysAction {
  return {
    type: UPDATE_GARDEN_HARVEST_DAYS,
    payload: {
      harvestDays,
      planId,
    },
    meta: {
      calculator: {
        recalculate: true,
        set: "garden",
      },
    },
  };
}

export const UPDATE_TREND_PERIOD = "UPDATE_TREND_PERIOD";
export type UpdateTrendPeriodAction = FSA<
  typeof UPDATE_TREND_PERIOD,
  CalculatorMeta,
  {
    trendPeriod: TrendPeriod;
    planId: string;
  }
>;

export function updateTrendPeriod(
  trendPeriod: TrendPeriod,
  planId: string
): UpdateTrendPeriodAction {
  return {
    type: UPDATE_TREND_PERIOD,
    payload: {
      trendPeriod,
      planId,
    },
    meta: {
      calculator: {
        recalculate: true,
        set: "faucet",
      },
    },
  };
}

export const UPDATE_GARDEN_TREND_PERIOD = "UPDATE_GARDEN_TREND_PERIOD";
export type UpdateGardenTrendPeriodAction = FSA<
  typeof UPDATE_GARDEN_TREND_PERIOD,
  CalculatorMeta,
  {
    trendPeriod: TrendPeriod;
    planId: string;
  }
>;

export function updateGardenTrendPeriod(
  trendPeriod: TrendPeriod,
  planId: string
): UpdateGardenTrendPeriodAction {
  return {
    type: UPDATE_GARDEN_TREND_PERIOD,
    payload: {
      trendPeriod,
      planId,
    },
    meta: {
      calculator: {
        recalculate: true,
        set: "garden",
      },
    },
  };
}

export const UPDATE_HYDRATE_FREQUENCY = "UPDATE_HYDRATE_FREQUENCY";
export type UpdateHydrateFrequencyAction = FSA<
  typeof UPDATE_HYDRATE_FREQUENCY,
  CalculatorMeta,
  {
    hydrateFrequency: HydrateFrequency;
    planId: string;
  }
>;

export function updateHydrateFrequency(
  hydrateFrequency: HydrateFrequency,
  planId: string
): UpdateHydrateFrequencyAction {
  return {
    type: UPDATE_HYDRATE_FREQUENCY,
    payload: {
      hydrateFrequency,
      planId,
    },
    meta: {
      calculator: {
        recalculate: true,
        set: "faucet",
      },
    },
  };
}

export const UPDATE_GARDEN_SOW_FREQUENCY = "UPDATE_GARDEN_SOW_FREQUENCY";
export type UpdateGardenSowFrequencyAction = FSA<
  typeof UPDATE_GARDEN_SOW_FREQUENCY,
  CalculatorMeta,
  {
    sowFrequency: SowFrequency;
    planId: string;
  }
>;

export function updateGardenSowFrequency(
  sowFrequency: SowFrequency,
  planId: string
): UpdateGardenSowFrequencyAction {
  return {
    type: UPDATE_GARDEN_SOW_FREQUENCY,
    payload: {
      sowFrequency,
      planId,
    },
    meta: {
      calculator: {
        recalculate: true,
        set: "garden",
      },
    },
  };
}

export const UPDATE_GARDEN_LAST_YEAR = "UPDATE_GARDEN_LAST_YEAR";
export type UpdateGardenLastYearAction = FSA<
  typeof UPDATE_GARDEN_LAST_YEAR,
  CalculatorMeta,
  {
    lastYear: number;
    planId: string;
  }
>;

export function updateGardenLastYear(
  lastYear: number,
  planId: string
): UpdateGardenLastYearAction {
  return {
    type: UPDATE_GARDEN_LAST_YEAR,
    payload: {
      lastYear,
      planId,
    },
    meta: {
      calculator: {
        recalculate: true,
        set: "garden",
      },
    },
  };
}
