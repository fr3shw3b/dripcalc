import { MiddlewareAPI, Dispatch, AnyAction } from "redux";

import { SettingsState } from "./reducers/settings";
import { ViewsState } from "./reducers/views";
import { WalletsState } from "./reducers/wallets";

/**
 * The type of the full application state
 * tree.
 */
export type AppState = {
  views: ViewsState;
  settings: SettingsState;
  wallets: WalletsState;
};

export type DispatchFunction = (action: AnyAction) => void;

export type MiddlewareFunction = (
  store: MiddlewareAPI<Dispatch<AnyAction>>
) => (next: Dispatch<AnyAction>) => DispatchFunction;
