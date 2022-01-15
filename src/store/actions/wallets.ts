import { Action } from "redux";
import { MonthInput } from "../reducers/wallets";
import { FSA } from "../types";

export const ADD_WALLET = "ADD_WALLET";
export type AddWalletAction = Action<typeof ADD_WALLET> & {
  id: string;
  label: string;
  startDate: number;
};

export function addWallet(
  id: string,
  label: string,
  startDate: number
): AddWalletAction {
  return {
    type: ADD_WALLET,
    id,
    label,
    startDate,
  };
}

export const UPDATE_CURRENT_WALLET = "UPDATE_CURRENT_WALLET";
export type UpdateCurrentWalletAction = Action<typeof UPDATE_CURRENT_WALLET> & {
  id: string;
};

export function updateCurrentWallet(id: string): UpdateCurrentWalletAction {
  return {
    type: UPDATE_CURRENT_WALLET,
    id,
  };
}

export const UPDATE_WALLET = "UPDATE_WALLET";
export type UpdateWalletAction = Action<typeof UPDATE_WALLET> & {
  id: string;
  label: string;
  startDate: number;
};

export function updateWallet(
  id: string,
  label: string,
  startDate: number
): UpdateWalletAction {
  return {
    type: UPDATE_WALLET,
    id,
    label,
    startDate,
  };
}

export const UPDATE_WALLET_MONTH_INPUTS = "UPDATE_WALLET_MONTH_INPUTS";
export type UpdateWalletMonthInputsAction = FSA<
  typeof UPDATE_WALLET_MONTH_INPUTS,
  {
    calculator: {
      recalculate: boolean;
    };
  },
  {
    id: string;
    monthInputs: Record<string, MonthInput>;
  }
>;

export function updateWalletMonthInputs(
  id: string,
  monthInputs: Record<string, MonthInput>
): UpdateWalletMonthInputsAction {
  return {
    type: UPDATE_WALLET_MONTH_INPUTS,
    payload: {
      id,
      monthInputs,
    },
    meta: {
      calculator: {
        recalculate: true,
      },
    },
  };
}
