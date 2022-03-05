import { Action } from "redux";
import { CalculationSet } from "../middleware/calculator";
import { MonthInput } from "../reducers/plans";
import { FSA } from "../types";

export const ADD_WALLET = "ADD_WALLET";
export type AddWalletAction = Action<typeof ADD_WALLET> & {
  id: string;
  planId: string;
  label: string;
  startDate: number;
  walletAddress?: string;
  meta: {
    chain: {
      importFrom?: string;
    };
  };
};

export function addWallet(
  id: string,
  planId: string,
  label: string,
  startDate: number,
  walletAddress?: string
): AddWalletAction {
  return {
    type: ADD_WALLET,
    id,
    planId,
    label,
    startDate,
    walletAddress,
    meta: {
      chain: {
        importFrom: walletAddress,
      },
    },
  };
}

export const UPDATE_CURRENT_WALLET = "UPDATE_CURRENT_WALLET";
export type UpdateCurrentWalletAction = Action<typeof UPDATE_CURRENT_WALLET> & {
  id: string;
  planId: string;
};

export function updateCurrentWallet(
  id: string,
  planId: string
): UpdateCurrentWalletAction {
  return {
    type: UPDATE_CURRENT_WALLET,
    planId,
    id,
  };
}

export const UPDATE_WALLET = "UPDATE_WALLET";
export type UpdateWalletAction = Action<typeof UPDATE_WALLET> & {
  id: string;
  planId: string;
  label: string;
  walletAddress?: string;
  startDate: number;
  // Start date changes should cause recalculation!
  meta: {
    calculator: {
      recalculate: boolean;
      set: CalculationSet;
    };
    chain: {
      importFrom?: string;
    };
  };
};

export function updateWallet(
  id: string,
  planId: string,
  label: string,
  startDate: number,
  walletAddress?: string
): UpdateWalletAction {
  return {
    type: UPDATE_WALLET,
    id,
    planId,
    label,
    startDate,
    walletAddress,
    meta: {
      calculator: {
        recalculate: true,
        set: "faucet",
      },
      chain: {
        importFrom: walletAddress,
      },
    },
  };
}

export const UPDATE_WALLET_MONTH_INPUTS = "UPDATE_WALLET_MONTH_INPUTS";
export type UpdateWalletMonthInputsAction = FSA<
  typeof UPDATE_WALLET_MONTH_INPUTS,
  {
    calculator: {
      recalculate: boolean;
      set: CalculationSet;
    };
  },
  {
    id: string;
    planId: string;
    monthInputs: Record<string, MonthInput>;
  }
>;

export function updateWalletMonthInputs(
  id: string,
  planId: string,
  monthInputs: Record<string, MonthInput>
): UpdateWalletMonthInputsAction {
  return {
    type: UPDATE_WALLET_MONTH_INPUTS,
    payload: {
      id,
      planId,
      monthInputs,
    },
    meta: {
      calculator: {
        recalculate: true,
        // Month inputs are for the garden and faucet calculators!
        set: "all",
      },
    },
  };
}

export const SELECT_PLAN = "SELECT_PLAN";
export type SelectPlanAction = FSA<
  typeof SELECT_PLAN,
  {},
  {
    id: string;
    label: string;
  }
>;

export function selectPlan(id: string, label: string): SelectPlanAction {
  return {
    type: SELECT_PLAN,
    payload: {
      id,
      label,
    },
    meta: {},
  };
}

export const REFRESH_CURRENT_PLAN_CALCULATIONS =
  "REFRESH_CURRENT_PLAN_CALCULATIONS";
export type RefreshCurrentPlanCalculationsAction = FSA<
  typeof REFRESH_CURRENT_PLAN_CALCULATIONS,
  {
    calculator: {
      recalculate: boolean;
      set: CalculationSet;
    };
  },
  {
    id: string;
  }
>;

export function refreshCalculations(
  id: string
): RefreshCurrentPlanCalculationsAction {
  return {
    type: REFRESH_CURRENT_PLAN_CALCULATIONS,
    payload: {
      id,
    },
    meta: {
      calculator: {
        recalculate: true,
        set: "all",
      },
    },
  };
}

export const UPDATE_PLAN_LABEL = "UPDATE_PLAN_LABEL";
export type UpdatePlanLabelAction = FSA<
  typeof UPDATE_PLAN_LABEL,
  {},
  {
    id: string;
    label: string;
  }
>;

export function updatePlanLabel(
  id: string,
  label: string
): UpdatePlanLabelAction {
  return {
    type: UPDATE_PLAN_LABEL,
    payload: {
      id,
      label,
    },
    meta: {},
  };
}
