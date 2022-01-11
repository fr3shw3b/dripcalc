import {
  HideSettingsPanelAction,
  HIDE_SETTINGS_PANEL,
  ShowOverviewAction,
  ShowSettingsPanelAction,
  ShowWalletsAction,
  SHOW_OVERVIEW,
  SHOW_SETTINGS_PANEL,
  SHOW_WALLETS,
} from "../actions/views";

export enum ShowTabView {
  Overview = 1,
  Wallets,
}

export type ViewsState = {
  showTabView: ShowTabView;
  isSettingsOpen: boolean;
};

export function initialState(): ViewsState {
  return {
    showTabView: ShowTabView.Overview,
    isSettingsOpen: false,
  };
}

type ViewsAction =
  | ShowOverviewAction
  | ShowWalletsAction
  | ShowSettingsPanelAction
  | HideSettingsPanelAction;

function reducer(state = initialState(), action: ViewsAction): ViewsState {
  return reducers[action.type]?.(state, action) ?? state;
}

const reducers = {
  [SHOW_OVERVIEW]: (state: ViewsState, _action: ViewsAction): ViewsState => {
    return {
      ...state,
      showTabView: ShowTabView.Overview,
    };
  },
  [SHOW_WALLETS]: (state: ViewsState, _action: ViewsAction): ViewsState => {
    return {
      ...state,
      showTabView: ShowTabView.Wallets,
    };
  },
  [SHOW_SETTINGS_PANEL]: (
    state: ViewsState,
    _action: ViewsAction
  ): ViewsState => {
    return {
      ...state,
      isSettingsOpen: true,
    };
  },
  [HIDE_SETTINGS_PANEL]: (
    state: ViewsState,
    _action: ViewsAction
  ): ViewsState => {
    return {
      ...state,
      isSettingsOpen: false,
    };
  },
};

export default reducer;
