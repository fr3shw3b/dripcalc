import {
  ADD_WALLET,
  AddWalletAction,
  UPDATE_CURRENT_WALLET,
  UpdateCurrentWalletAction,
  UpdateWalletAction,
  UPDATE_WALLET,
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
  dripValue: number;
  // Fraction from 0 to 1.
  reinvest: number;
};

export function initialState(): WalletsState {
  return {
    wallets: [
      {
        id: "default-wallet",
        label: "Default Wallet",
        startDate: new Date().getTime(),
        monthInputs: {},
      },
    ],
    current: "default-wallet",
  };
}

type WalletsAction =
  | AddWalletAction
  | UpdateCurrentWalletAction
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
    const updatedWallet = {
      id: (action as UpdateWalletAction).id,
      label: (action as UpdateWalletAction).label,
      startDate: (action as UpdateWalletAction).startDate,
      monthInputs: {},
    };
    const toUpdateIndex = state.wallets.findIndex(
      ({ id }) => id === (action as UpdateWalletAction).id
    );

    return {
      ...state,
      wallets: [
        ...state.wallets.slice(0, toUpdateIndex),
        updatedWallet,
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
