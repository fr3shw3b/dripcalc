import { CalculationSet } from "../middleware/calculator";
import { FSA } from "../types";

export const REMOVE_NOTIFICATION = "REMOVE_NOTIFICATION";
export type RemoveNotificationAction = FSA<
  typeof REMOVE_NOTIFICATION,
  {},
  {
    id: string;
  }
>;

export function removeNotification(id: string): RemoveNotificationAction {
  return {
    type: REMOVE_NOTIFICATION,
    payload: {
      id,
    },
    meta: {},
  };
}

export const SET_NOT_FIRST_TIME = "SET_NOT_FIRST_TIME";
export type SetNotFirstTimeAction = FSA<
  typeof SET_NOT_FIRST_TIME,
  {
    calculator: {
      recalculate: boolean;
      set: CalculationSet;
    };
  },
  {}
>;

export function setNotFirstTime(): SetNotFirstTimeAction {
  return {
    type: SET_NOT_FIRST_TIME,
    payload: {},
    meta: {
      calculator: {
        recalculate: true,
        set: "all",
      },
    },
  };
}

export const CLEAN_ALL_DATA = "CLEAN_ALL_DATA";
export type CleanAllDataAction = FSA<
  typeof CLEAN_ALL_DATA,
  {
    persistence: {
      cleanAll: boolean;
    };
  },
  {}
>;

export function cleanAllData(): CleanAllDataAction {
  return {
    type: CLEAN_ALL_DATA,
    payload: {},
    meta: {
      persistence: {
        cleanAll: true,
      },
    },
  };
}

export const INITIALISE_APP = "INITIALISE_APP";
export type InitialiseAppAction = FSA<
  typeof INITIALISE_APP,
  {
    price: {
      refreshDripNativeDexPrice: boolean;
      refreshOnInterval?: number;
      refreshDripBUSDLPPrice: boolean;
    };
  },
  {}
>;

export function initialiseApp(refreshOnInterval?: number): InitialiseAppAction {
  return {
    type: INITIALISE_APP,
    payload: {},
    meta: {
      price: {
        refreshDripNativeDexPrice: true,
        refreshOnInterval,
        refreshDripBUSDLPPrice: true,
      },
    },
  };
}

export const TOGGLE_FIAT_MODE = "TOGGLE_FIAT_MODE";
export type ToggleFiatModeAction = FSA<
  typeof TOGGLE_FIAT_MODE,
  {
    calculator: {
      recalculate: boolean;
      set: CalculationSet;
    };
  },
  {}
>;

export function toggleFiatMode(): ToggleFiatModeAction {
  return {
    type: TOGGLE_FIAT_MODE,
    payload: {},
    meta: {
      calculator: {
        recalculate: true,
        set: "all",
      },
    },
  };
}
