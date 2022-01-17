import moment from "moment";
import { nanoid } from "nanoid";
import { config } from "../../contexts/config";
import {
  ADD_WALLET,
  AddWalletAction,
  UPDATE_CURRENT_WALLET,
  UpdateCurrentWalletAction,
  UpdateWalletAction,
  UPDATE_WALLET,
  UpdateWalletMonthInputsAction,
  UPDATE_WALLET_MONTH_INPUTS,
} from "../actions/wallets";

export type WalletsState = {
  wallets: WalletState[];
  current: string;
};

export type WalletState = {
  id: string;
  label: string;
  // We derive the end date when max payout/max payout cap is reached.
  startDate: number;
  // [date] -> [value] (e.g. "01/01/2022" -> [value])
  monthInputs: Record<string, MonthInput>;
};

export type MonthInput = {
  dripValue?: number;
  // Fraction from 0 to 1.
  reinvest?: number;
  deposits: Deposit[];
};

export type Deposit = {
  dayOfMonth: number;
  amountInCurrency: number;
  // Multiple deposits will have the same ID when a part of a monthly
  // deposit range!
  depositId: string;
  // Mostly useful for transforming deposit data to be presented in the deposit editor.
  timestamp: number;
};

export function initialState(): WalletsState {
  const seed: Record<string, MonthInput> = {};
  const conf = config();
  const currentDate = new Date();
  const depositsId = nanoid();

  return {
    wallets: [
      {
        id: "default-wallet",
        label: "Default Wallet",
        startDate: currentDate.getTime(),
        // Default deposits of (£|$|€)100 for 12 months.
        monthInputs: [...Array(12)].reduce((defaultMonthInputs, _val, i) => {
          const monthMomentDate = moment(currentDate).add(i, "month");
          return {
            ...defaultMonthInputs,
            [monthMomentDate.format("01/MM/YYYY")]: {
              dripValue: conf.defaultDripValue,
              reinvest: conf.defaultReinvest,
              deposits: [
                {
                  dayOfMonth: Number.parseInt(monthMomentDate.format("D")),
                  amountInCurrency: 100,
                  // Use same ID so the UI picks it up as a monthly deposit.
                  depositId: depositsId,
                  timestamp: Number.parseInt(monthMomentDate.format("x")),
                },
              ],
            },
          };
        }, seed),
      },
    ],
    current: "default-wallet",
  };
}

export type WalletsAction =
  | AddWalletAction
  | UpdateCurrentWalletAction
  | UpdateWalletMonthInputsAction
  | UpdateWalletAction;

function reducer(state = initialState(), action: WalletsAction): WalletsState {
  return reducers[action.type]?.(state, action) ?? state;
}

const reducers = {
  [ADD_WALLET]: (state: WalletsState, action: WalletsAction): WalletsState => {
    return {
      ...state,
      wallets: [
        ...state.wallets,
        {
          id: (action as AddWalletAction).id,
          label: (action as AddWalletAction).label,
          startDate: (action as AddWalletAction).startDate,
          monthInputs: {},
        },
      ],
    };
  },
  [UPDATE_WALLET]: (
    state: WalletsState,
    action: WalletsAction
  ): WalletsState => {
    const toUpdateIndex = state.wallets.findIndex(
      ({ id }) => id === (action as UpdateWalletAction).id
    );

    const updatedWallet = {
      id: (action as UpdateWalletAction).id,
      label: (action as UpdateWalletAction).label,
      startDate: (action as UpdateWalletAction).startDate,
      monthInputs: state.wallets[toUpdateIndex].monthInputs,
    };

    return {
      ...state,
      wallets: [
        ...state.wallets.slice(0, toUpdateIndex),
        updatedWallet,
        ...state.wallets.slice(toUpdateIndex + 1),
      ],
    };
  },
  [UPDATE_WALLET_MONTH_INPUTS]: (
    state: WalletsState,
    action: WalletsAction
  ): WalletsState => {
    const toUpdateIndex = state.wallets.findIndex(
      ({ id }) => id === (action as UpdateWalletMonthInputsAction).payload.id
    );

    return {
      ...state,
      wallets: [
        ...state.wallets.slice(0, toUpdateIndex),
        {
          ...state.wallets[toUpdateIndex],
          monthInputs: (action as UpdateWalletMonthInputsAction).payload
            .monthInputs,
        },
        ...state.wallets.slice(toUpdateIndex + 1),
      ],
    };
  },
  [UPDATE_CURRENT_WALLET]: (
    state: WalletsState,
    action: WalletsAction
  ): WalletsState => {
    return {
      ...state,
      current: (action as UpdateCurrentWalletAction).id,
    };
  },
};

export default reducer;
