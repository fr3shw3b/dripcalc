import { FSA } from "../types";

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
  }
>;

export function updateDripValueTrend(
  trend: string
): UpdateDripValueTrendAction {
  return {
    type: UPDATE_DRIP_VALUE_TREND,
    payload: {
      trend,
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
  }
>;

export function updateCurrency(
  currency: "$" | "£" | "€"
): UpdateCurrencyAction {
  return {
    type: UPDATE_CURRENCY,
    payload: {
      currency,
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
  }
>;

export function updateUptrendMaxValueChange(
  value: number
): UpdateUptrendMaxValueChangeAction {
  return {
    type: UPDATE_UPTREND_MAX_VALUE_CHANGE,
    payload: {
      value,
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
  }
>;

export function updateDowntrendMinValueChange(
  value: number
): UpdateDowntrendMinValueChangeAction {
  return {
    type: UPDATE_DOWNTREND_MIN_VALUE_CHANGE,
    payload: {
      value,
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
  }
>;

export function updateStabilisesAt(value: number): UpdateStabilisesAtAction {
  return {
    type: UPDATE_STABILISES_AT,
    payload: {
      value,
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
  }
>;

export function updateAverageGasFee(value: number): UpdateAverageGasFeeAction {
  return {
    type: UPDATE_AVERAGE_GAS_FEE,
    payload: {
      value,
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
  }
>;

export function updateClaimDays(claimDays: string): UpdateClaimDaysAction {
  return {
    type: UPDATE_CLAIM_DAYS,
    payload: {
      claimDays,
    },
    meta: {
      calculator: {
        recalculate: true,
      },
    },
  };
}
