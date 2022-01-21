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
  SelectPlanAction,
  SELECT_PLAN,
} from "../actions/plans";

export type PlansState = {
  plans: PlanState[];
  current: string;
};

export type PlanState = {
  id: string;
  label: string;
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

export function initialState(): PlansState {
  return {
    plans: [
      {
        id: "default-plan",
        label: "Default Plan",
        ...createDefaultWalletInfo(),
      },
    ],
    current: "default-plan",
  };
}

function createDefaultWalletInfo() {
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

export type PlansAction =
  | SelectPlanAction
  | AddWalletAction
  | UpdateCurrentWalletAction
  | UpdateWalletMonthInputsAction
  | UpdateWalletAction;

function reducer(state = initialState(), action: PlansAction): PlansState {
  return reducers[action.type]?.(state, action) ?? state;
}

const reducers = {
  [SELECT_PLAN]: (state: PlansState, action: PlansAction): PlansState => {
    const selectPlanAction = action as SelectPlanAction;
    const existingPlanIndex = state.plans.findIndex(
      (plan) => plan.id === selectPlanAction.payload.id
    );

    if (existingPlanIndex > -1) {
      return {
        current: selectPlanAction.payload.id,
        plans: state.plans,
      };
    }

    return {
      current: selectPlanAction.payload.id,
      plans: [
        ...state.plans,
        {
          id: selectPlanAction.payload.id,
          label: selectPlanAction.payload.label,
          ...createDefaultWalletInfo(),
        },
      ],
    };
  },
  [ADD_WALLET]: (state: PlansState, action: PlansAction): PlansState => {
    const addWalletAction = action as AddWalletAction;
    const planIndex = state.plans.findIndex(
      (plan) => addWalletAction.planId === plan.id
    );
    const updatedPlanState: PlanState = {
      ...state.plans[planIndex],
      wallets: [
        ...(state.plans[planIndex]?.wallets ?? []),
        {
          id: (action as AddWalletAction).id,
          label: (action as AddWalletAction).label,
          startDate: (action as AddWalletAction).startDate,
          monthInputs: {},
        },
      ],
    };
    return {
      ...state,
      plans: [
        ...state.plans.slice(0, planIndex),
        updatedPlanState,
        ...state.plans.slice(planIndex + 1),
      ],
    };
  },
  [UPDATE_WALLET]: (state: PlansState, action: PlansAction): PlansState => {
    const updateWalletAction = action as UpdateWalletAction;
    const planIndex = state.plans.findIndex(
      (plan) => updateWalletAction.planId === plan.id
    );
    const toUpdateIndex = state.plans[planIndex].wallets.findIndex(
      ({ id }) => id === (action as UpdateWalletAction).id
    );

    const updatedWallet = {
      id: (action as UpdateWalletAction).id,
      label: (action as UpdateWalletAction).label,
      startDate: (action as UpdateWalletAction).startDate,
      monthInputs: state.plans[planIndex].wallets[toUpdateIndex].monthInputs,
    };

    const updatedPlanState: PlanState = {
      ...state.plans[planIndex],
      wallets: [
        ...state.plans[planIndex].wallets.slice(0, toUpdateIndex),
        updatedWallet,
        ...state.plans[planIndex].wallets.slice(toUpdateIndex + 1),
      ],
    };

    return {
      ...state,
      plans: [
        ...state.plans.slice(0, planIndex),
        updatedPlanState,
        ...state.plans.slice(planIndex + 1),
      ],
    };
  },
  [UPDATE_WALLET_MONTH_INPUTS]: (
    state: PlansState,
    action: PlansAction
  ): PlansState => {
    const updateWalletMonthInputsAction =
      action as UpdateWalletMonthInputsAction;
    const planIndex = state.plans.findIndex(
      (plan) => updateWalletMonthInputsAction.payload.planId === plan.id
    );
    const toUpdateIndex = state.plans[planIndex].wallets.findIndex(
      ({ id }) => id === (action as UpdateWalletMonthInputsAction).payload.id
    );

    const updatedWallet = {
      ...state.plans[planIndex].wallets[toUpdateIndex],
      monthInputs: (action as UpdateWalletMonthInputsAction).payload
        .monthInputs,
    };

    const updatedPlanState: PlanState = {
      ...state.plans[planIndex],
      wallets: [
        ...state.plans[planIndex].wallets.slice(0, toUpdateIndex),
        updatedWallet,
        ...state.plans[planIndex].wallets.slice(toUpdateIndex + 1),
      ],
    };

    return {
      ...state,
      plans: [
        ...state.plans.slice(0, planIndex),
        updatedPlanState,
        ...state.plans.slice(planIndex + 1),
      ],
    };
  },
  [UPDATE_CURRENT_WALLET]: (
    state: PlansState,
    action: PlansAction
  ): PlansState => {
    const updateCurrentWalletAction = action as UpdateCurrentWalletAction;
    const planIndex = state.plans.findIndex(
      (plan) => updateCurrentWalletAction.planId === plan.id
    );

    const updatedPlanState: PlanState = {
      ...state.plans[planIndex],
      current: updateCurrentWalletAction.id,
    };

    return {
      ...state,
      plans: [
        ...state.plans.slice(0, planIndex),
        updatedPlanState,
        ...state.plans.slice(planIndex + 1),
      ],
    };
  },
};

export default reducer;