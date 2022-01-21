import type { TrendPeriod } from "../../services/drip-value-provider";
import type { FSA } from "../types";

type CalculatorMeta = {
  calculator: {
    recalculate: boolean;
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
      },
    },
  };
}

export const UPDATE_CURRENCY = "UPDATE_CURRENCY";
export type UpdateCurrencyAction = FSA<
  typeof UPDATE_CURRENCY,
  {},
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
    meta: {},
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
      },
    },
  };
}
