import type { MiddlewareAPI, Dispatch, AnyAction } from "redux";
import { DripBUSDConnector } from "../../services/dripbusd-connector";
import { DripCalcApi } from "../../services/dripcalcapi";
import { FaucetConnector } from "../../services/faucet-connector";
import type { AppState, FSA, MiddlewareFunction } from "../types";

type ActionWithContractsSupport<T extends unknown> = FSA<
  T,
  {
    chain: {
      importFrom?: string;
    };
  },
  Record<string, unknown>
>;

type ChainConfig = {
  dripBUSDConnector: DripBUSDConnector;
  faucetConnector: FaucetConnector;
  dripCalcApi: DripCalcApi;
};

function chain<State extends AppState = AppState>({
  dripBUSDConnector,
  faucetConnector,
  dripCalcApi,
}: ChainConfig): MiddlewareFunction {
  return (store: MiddlewareAPI<Dispatch<AnyAction>, State>) =>
    (next: Dispatch<AnyAction>) =>
    (action: AnyAction) => {
      if (supportsChain(action)) {
      }
      next(action);
    };
}

function supportsChain<ActionType>(
  action: AnyAction
): action is ActionWithContractsSupport<ActionType> {
  return !!action.meta?.chain;
}

export default chain;
