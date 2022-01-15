import type { FSA } from "../types";
import { EarningsAndInfo } from "./shared-calculator-types";

export const CALCULATING_EARNINGS = "CALCULATING_EARNINGS";
export type CalculatingEarningsAction = FSA<
  typeof CALCULATING_EARNINGS,
  {},
  {}
>;

export function calculatingEarnings(): CalculatingEarningsAction {
  return {
    type: CALCULATING_EARNINGS,
    payload: {},
    meta: {},
  };
}

export const EARNINGS_CALCULATED = "EARNINGS_CALCULATED";
export type EarningsCalculatedAction = FSA<
  typeof EARNINGS_CALCULATED,
  Record<string, unknown>,
  {
    earningsAndInfo: EarningsAndInfo;
  }
>;

export function earningsCalculated(
  earningsAndInfo: EarningsAndInfo
): EarningsCalculatedAction {
  return {
    type: EARNINGS_CALCULATED,
    payload: {
      earningsAndInfo,
    },
    meta: {},
  };
}

export const FAILED_CALCULATING_EARNINGS = "FAILED_CALCULATING_EARNINGS";
export type FailedCalulatingEarningsAction = FSA<
  typeof FAILED_CALCULATING_EARNINGS,
  Record<string, unknown>,
  {}
> & { error: { message: string; stack?: string } };
export function failedCalculatingEarnings(
  error: Error
): FailedCalulatingEarningsAction {
  return {
    type: FAILED_CALCULATING_EARNINGS,
    error: { message: error.message, stack: error.stack },
    payload: {},
    meta: {},
  };
}
