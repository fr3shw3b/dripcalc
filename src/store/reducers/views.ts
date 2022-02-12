import { SelectPlanAction, SELECT_PLAN } from "../actions/plans";
import {
  HideSettingsPanelAction,
  HIDE_SETTINGS_PANEL,
  ShowGardenOverviewAction,
  ShowGardenPlanAction,
  ShowOverviewAction,
  ShowSettingsPanelAction,
  ShowWalletsAction,
  SHOW_GARDEN_OVERVIEW,
  SHOW_GARDEN_PLAN,
  SHOW_OVERVIEW,
  SHOW_SETTINGS_PANEL,
  SHOW_WALLETS,
} from "../actions/views";

export enum ShowTabView {
  Overview = 1,
  Wallets,
}

export enum ShowGardenTabView {
  Overview = 1,
  Plan,
}

export type ViewsState = {
  [planId: string]: {
    showTabView: ShowTabView;
    showGardenTabView: ShowGardenTabView;
    isSettingsOpen: boolean;
  };
};

export function initialState(): ViewsState {
  return {
    "default-plan": {
      showTabView: ShowTabView.Overview,
      showGardenTabView: ShowGardenTabView.Overview,
      isSettingsOpen: false,
    },
  };
}

export type ViewsAction =
  | SelectPlanAction
  | ShowOverviewAction
  | ShowGardenOverviewAction
  | ShowGardenPlanAction
  | ShowWalletsAction
  | ShowSettingsPanelAction
  | HideSettingsPanelAction;

function reducer(state = initialState(), action: ViewsAction): ViewsState {
  return reducers[action.type]?.(state, action) ?? state;
}

const reducers = {
  [SELECT_PLAN]: (state: ViewsState, action: ViewsAction): ViewsState => {
    const finalAction = action as SelectPlanAction;
    if (state[finalAction.payload.id]) {
      return state;
    }

    return {
      ...state,
      [finalAction.payload.id]: {
        showTabView: ShowTabView.Overview,
        showGardenTabView: ShowGardenTabView.Overview,
        isSettingsOpen: false,
      },
    };
  },
  [SHOW_OVERVIEW]: (state: ViewsState, action: ViewsAction): ViewsState => {
    const finalAction = action as ShowOverviewAction;
    return {
      ...state,
      [finalAction.planId]: {
        ...state[finalAction.planId],
        showTabView: ShowTabView.Overview,
      },
    };
  },
  [SHOW_WALLETS]: (state: ViewsState, action: ViewsAction): ViewsState => {
    const finalAction = action as ShowWalletsAction;
    return {
      ...state,
      [finalAction.planId]: {
        ...state[finalAction.planId],
        showTabView: ShowTabView.Wallets,
      },
    };
  },
  [SHOW_GARDEN_OVERVIEW]: (
    state: ViewsState,
    action: ViewsAction
  ): ViewsState => {
    const finalAction = action as ShowOverviewAction;
    return {
      ...state,
      [finalAction.planId]: {
        ...state[finalAction.planId],
        showGardenTabView: ShowGardenTabView.Overview,
      },
    };
  },
  [SHOW_GARDEN_PLAN]: (state: ViewsState, action: ViewsAction): ViewsState => {
    const finalAction = action as ShowWalletsAction;
    return {
      ...state,
      [finalAction.planId]: {
        ...state[finalAction.planId],
        showGardenTabView: ShowGardenTabView.Plan,
      },
    };
  },
  [SHOW_SETTINGS_PANEL]: (
    state: ViewsState,
    action: ViewsAction
  ): ViewsState => {
    const finalAction = action as ShowSettingsPanelAction;
    return {
      ...state,
      [finalAction.planId]: {
        ...state[finalAction.planId],
        isSettingsOpen: true,
      },
    };
  },
  [HIDE_SETTINGS_PANEL]: (
    state: ViewsState,
    action: ViewsAction
  ): ViewsState => {
    const finalAction = action as HideSettingsPanelAction;
    return {
      ...state,
      [finalAction.planId]: {
        ...state[finalAction.planId],
        isSettingsOpen: false,
      },
    };
  },
};

export default reducer;
