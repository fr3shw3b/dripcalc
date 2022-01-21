import { combineReducers } from "redux";

import views, { initialState as viewsInitialState } from "./views";
import settings, { initialState as settingsInitialState } from "./settings";
import plans, { initialState as plansInitialState } from "./plans";
import general, { initialState as generalInitialState } from "./general";
import { AppState } from "../types";

function createRootReducer() {
  return combineReducers({
    views,
    settings,
    plans,
    general,
  });
}

export function initialState(): Partial<AppState> {
  return {
    views: viewsInitialState(),
    settings: settingsInitialState(),
    plans: plansInitialState(),
    general: generalInitialState(),
  };
}

export default createRootReducer;
