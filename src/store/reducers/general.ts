import { nanoid } from "nanoid";
import {
  CalculatingEarningsAction,
  CALCULATING_EARNINGS,
  EarningsCalculatedAction,
  EARNINGS_CALCULATED,
  FailedCalulatingEarningsAction,
  FAILED_CALCULATING_EARNINGS,
} from "../middleware/calculator-actions";
import {
  REMOVE_NOTIFICATION,
  RemoveNotificationAction,
  SET_NOT_FIRST_TIME,
  SetNotFirstTimeAction,
} from "../actions/general";
import { EarningsAndInfo } from "../middleware/shared-calculator-types";

export type GeneralState = {
  notifications: Notification[];
  isCalculating: boolean;
  isFirstTime: boolean;
  calculatedEarnings?: EarningsAndInfo;
};

export type Notification = {
  id: string;
  message: string;
  type: "error" | "info" | "warning";
  error?: {
    stack?: string;
  };
};

export function initialState(): GeneralState {
  return {
    notifications: [],
    isCalculating: false,
    isFirstTime: true,
  };
}

export type GeneralAction =
  | FailedCalulatingEarningsAction
  | CalculatingEarningsAction
  | EarningsCalculatedAction
  | SetNotFirstTimeAction
  | RemoveNotificationAction;

function reducer(state = initialState(), action: GeneralAction): GeneralState {
  return reducers[action.type]?.(state, action) ?? state;
}

const reducers = {
  [FAILED_CALCULATING_EARNINGS]: (
    state: GeneralState,
    action: GeneralAction
  ): GeneralState => {
    return {
      ...state,
      isCalculating: false,
      notifications: [
        ...state.notifications,
        {
          id: nanoid(),
          message: (action as FailedCalulatingEarningsAction).error.message,
          type: "error",
          error: (action as FailedCalulatingEarningsAction).error,
        },
      ],
    };
  },
  [CALCULATING_EARNINGS]: (
    state: GeneralState,
    _action: GeneralAction
  ): GeneralState => {
    return {
      ...state,
      isCalculating: true,
    };
  },
  [EARNINGS_CALCULATED]: (
    state: GeneralState,
    action: GeneralAction
  ): GeneralState => {
    return {
      ...state,
      isCalculating: false,
      calculatedEarnings: (action as EarningsCalculatedAction).payload
        .earningsAndInfo,
    };
  },
  [REMOVE_NOTIFICATION]: (
    state: GeneralState,
    action: GeneralAction
  ): GeneralState => {
    return {
      ...state,
      notifications: state.notifications.filter(
        ({ id }) => id !== (action as RemoveNotificationAction).payload.id
      ),
    };
  },
  [SET_NOT_FIRST_TIME]: (
    state: GeneralState,
    _action: GeneralAction
  ): GeneralState => {
    return {
      ...state,
      isFirstTime: false,
    };
  },
};

export default reducer;
