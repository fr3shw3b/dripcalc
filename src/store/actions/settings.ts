import { Action } from "redux";

export const UPDATE_DRIP_VALUE_TREND = "UPDATE_DRIP_VALUE_TREND";
export type UpdateDripValueTrendAction = Action<
  typeof UPDATE_DRIP_VALUE_TREND
> & {
  trend: string;
};

export function updateDripValueTrend(
  trend: string
): UpdateDripValueTrendAction {
  return {
    type: UPDATE_DRIP_VALUE_TREND,
    trend,
  };
}

export const UPDATE_CURRENCY = "UPDATE_CURRENCY";
export type UpdateCurrencyAction = Action<typeof UPDATE_CURRENCY> & {
  currency: "$" | "£" | "€";
};

export function updateCurrency(
  currency: "$" | "£" | "€"
): UpdateCurrencyAction {
  return {
    type: UPDATE_CURRENCY,
    currency,
  };
}

export const UPDATE_UPTREND_MAX_VALUE_CHANGE =
  "UPDATE_UPTREND_MAX_VALUE_CHANGE";
export type UpdateUptrendMaxValueChangeAction = Action<
  typeof UPDATE_UPTREND_MAX_VALUE_CHANGE
> & {
  value: number;
};

export function updateUptrendMaxValueChange(
  value: number
): UpdateUptrendMaxValueChangeAction {
  return {
    type: UPDATE_UPTREND_MAX_VALUE_CHANGE,
    value,
  };
}

export const UPDATE_DOWNTREND_MIN_VALUE_CHANGE =
  "UPDATE_DOWNTREND_MIN_VALUE_CHANGE";
export type UpdateDowntrendMinValueChangeAction = Action<
  typeof UPDATE_DOWNTREND_MIN_VALUE_CHANGE
> & {
  value: number;
};

export function updateDowntrendMinValueChange(
  value: number
): UpdateDowntrendMinValueChangeAction {
  return {
    type: UPDATE_DOWNTREND_MIN_VALUE_CHANGE,
    value,
  };
}

export const UPDATE_STABILISES_AT = "UPDATE_STABILISES_AT";
export type UpdateStabilisesAtAction = Action<typeof UPDATE_STABILISES_AT> & {
  value: number;
};

export function updateStabilisesAt(value: number): UpdateStabilisesAtAction {
  return {
    type: UPDATE_STABILISES_AT,
    value,
  };
}

export const UPDATE_AVERAGE_GAS_FEE = "UPDATE_AVERAGE_GAS_FEE";
export type UpdateAverageGasFeeAction = Action<
  typeof UPDATE_AVERAGE_GAS_FEE
> & {
  value: number;
};

export function updateAverageGasFee(value: number): UpdateAverageGasFeeAction {
  return {
    type: UPDATE_AVERAGE_GAS_FEE,
    value,
  };
}

export const UPDATE_CLAIM_DAYS = "UPDATE_CLAIM_DAYS";
export type UpdateClaimDaysAction = Action<typeof UPDATE_CLAIM_DAYS> & {
  claimDays: string;
};

export function updateClaimDays(claimDays: string): UpdateClaimDaysAction {
  return {
    type: UPDATE_CLAIM_DAYS,
    claimDays,
  };
}
