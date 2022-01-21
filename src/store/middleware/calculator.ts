import type { MiddlewareAPI, Dispatch, AnyAction } from "redux";
import { wrap } from "comlink";

import type { AppState, FSA, MiddlewareFunction } from "../types";
import type { Config } from "../../contexts/config";
import type { AppState as AppStateForCalculator } from "./calculator.worker";
import reducer from "../reducers";
import { SettingsAction } from "../reducers/settings";
import { PlansAction } from "../reducers/plans";

import {
  calculatingEarnings,
  earningsCalculated,
  failedCalculatingEarnings,
} from "./calculator-actions";

import Worker, { CalculatorWorkerApi } from "./calculator.worker";

type ActionWithCalculatorSupport<T extends unknown> = FSA<
  T,
  {
    calculator: {
      recalculate: boolean;
    };
  },
  Record<string, unknown>
>;

const calculatorWorkerInstance = new Worker();
const calculatorWorkerApi = wrap<CalculatorWorkerApi>(calculatorWorkerInstance);

function calculator<State extends AppState = AppState>(
  config: Config
): MiddlewareFunction {
  return (store: MiddlewareAPI<Dispatch<AnyAction>, State>) =>
    (next: Dispatch<AnyAction>) =>
    (action: AnyAction) => {
      if (supportsCalculator(action)) {
        const { recalculate } = action.meta.calculator;

        if (recalculate) {
          store.dispatch(calculatingEarnings());

          // Apply the action using the application reducer,
          // this is duplicating the reducer call but is needed
          // so the middleware can run the calculations on the new state.
          const appliedState = reducer()(
            store.getState(),
            action as SettingsAction | PlansAction
          );
          calculatorWorkerApi
            .calculateEarnings(
              JSON.stringify({
                config,

                state: adaptState(appliedState),
              })
            )
            .then((earningsSerialised) => {
              const earnings = JSON.parse(earningsSerialised);
              store.dispatch(
                earningsCalculated(earnings, appliedState.plans.current)
              );
            })
            .catch((error) => {
              console.error(error);
              store.dispatch(failedCalculatingEarnings(error as Error));
            });
        }
      }
      next(action);
    };
}

function adaptState<SourceState extends AppState>(
  state: SourceState
): AppStateForCalculator {
  const currentPlanId = state.plans.current;
  const planIndex = state.plans.plans.findIndex(
    (plan) => plan.id === currentPlanId
  );
  return {
    settings: state.settings[currentPlanId],
    wallets: {
      wallets: state.plans.plans[planIndex].wallets,
    },
  };
}

function supportsCalculator<ActionType>(
  action: AnyAction
): action is ActionWithCalculatorSupport<ActionType> {
  return !!action.meta?.calculator;
}

export default calculator;
