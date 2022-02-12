import { combineReducers } from "redux";

import views, {
  initialState as viewsInitialState,
  ShowGardenTabView,
  ShowTabView,
  ViewsAction,
} from "./views";
import settings, {
  initialState as settingsInitialState,
  SettingsAction,
} from "./settings";
import plans, { initialState as plansInitialState, PlansAction } from "./plans";
import general, {
  GeneralAction,
  initialState as generalInitialState,
} from "./general";
import { AppState } from "../types";
import { CleanAllDataAction, CLEAN_ALL_DATA } from "../actions/general";

function createRootReducer() {
  const appReducer = combineReducers<AppState>({
    views,
    settings,
    plans,
    general,
  });
  return (
    state: AppState | undefined,
    action:
      | GeneralAction
      | SettingsAction
      | PlansAction
      | ViewsAction
      | CleanAllDataAction
  ): AppState => {
    if (action.type === CLEAN_ALL_DATA) {
      const resetState = initialState();
      // The user will have explicitly requested to clean
      // data so we won't bother them with the first time user screen!
      return {
        ...resetState,
        general: {
          ...resetState.general,
          isFirstTime: false,
        },
        views: {
          ...resetState.views,
          // Make sure the user is taken straight to the wallets
          // view of the new default plan like they would have been
          // on first load.
          "default-plan": {
            showTabView: ShowTabView.Wallets,
            showGardenTabView: ShowGardenTabView.Overview,
            isSettingsOpen: false,
          },
        },
      };
    }

    return appReducer(state, action);
  };
}

export function initialState(): AppState {
  return {
    views: viewsInitialState(),
    settings: settingsInitialState(),
    plans: plansInitialState(),
    general: generalInitialState(),
  };
}

export default createRootReducer;
