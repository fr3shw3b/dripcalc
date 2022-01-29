import type { MiddlewareAPI, Dispatch, AnyAction } from "redux";
import type { AppState, FSA, MiddlewareFunction } from "../types";
import { Storage } from "../../services/storage";

type ActionWithPersistenceSupport<T extends unknown> = FSA<
  T,
  {
    persistence: {
      cleanAll: boolean;
    };
  },
  Record<string, unknown>
>;

function persistence<State extends AppState = AppState>(
  storage: Storage
): MiddlewareFunction {
  return (store: MiddlewareAPI<Dispatch<AnyAction>, State>) =>
    (next: Dispatch<AnyAction>) =>
    (action: AnyAction) => {
      if (supportsPersistence(action)) {
        const { cleanAll } = action.meta.persistence;

        if (cleanAll) {
          storage.removeData("statev2").then(() => {
            store.dispatch(calculateEarningsAfterDataClean());
          });
        }
      }
      next(action);
    };
}

function supportsPersistence<ActionType>(
  action: AnyAction
): action is ActionWithPersistenceSupport<ActionType> {
  return !!action.meta?.persistence;
}

export default persistence;

export const CALCULATE_EARNINGS_AFTER_DATA_CLEAN =
  "CALCULATE_EARNINGS_AFTER_DATA_CLEAN";
export type ForceCalculateEarningsAction = FSA<
  typeof CALCULATE_EARNINGS_AFTER_DATA_CLEAN,
  {
    calculator: {
      recalculate: boolean;
    };
  },
  {}
>;

export function calculateEarningsAfterDataClean(): ForceCalculateEarningsAction {
  return {
    type: CALCULATE_EARNINGS_AFTER_DATA_CLEAN,
    payload: {},
    meta: {
      calculator: {
        recalculate: true,
      },
    },
  };
}
