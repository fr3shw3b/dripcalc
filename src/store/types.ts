import { MiddlewareAPI, Dispatch, AnyAction, Action } from "redux";
import { GeneralState } from "./reducers/general";

import { SettingsState } from "./reducers/settings";
import { ViewsState } from "./reducers/views";
import { PlansState } from "./reducers/plans";
import { PriceState } from "./reducers/price";

export type FSA<ActionType, Meta, Payload> = Action<ActionType> & {
  meta: Meta;
  payload: Payload;
};

/**
 * The type of the full application state
 * tree.
 */
export type AppState = {
  views: ViewsState;
  settings: SettingsState;
  plans: PlansState;
  general: GeneralState;
  price: PriceState;
};

export type DispatchFunction = (action: AnyAction) => void;

export type MiddlewareFunction = (
  store: MiddlewareAPI<Dispatch<AnyAction>>
) => (next: Dispatch<AnyAction>) => DispatchFunction;
