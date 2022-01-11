import { combineReducers } from "redux";

import views, { initialState as viewsInitialState } from "./views";
import settings, { initialState as settingsInitialState } from "./settings";
import wallets, { initialState as walletsInitialState } from "./wallets";
import { AppState } from "../types";

function createRootReducer() {
  return combineReducers({
    views,
    settings,
    wallets,
  });
}

export function initialState(): Partial<AppState> {
  return {
    views: viewsInitialState(),
    settings: settingsInitialState(),
    wallets: walletsInitialState(),
  };
}

export default createRootReducer;
