import { HTMLTable, Position } from "@blueprintjs/core";
import { useContext } from "react";
import { useSelector } from "react-redux";
import { AppState } from "../../store/types";

import ContentContext from "../../contexts/content";
import FeatureTogglesContext from "../../contexts/feature-toggles";
import { Tooltip2 } from "@blueprintjs/popover2";
import formatCurrency from "../../utils/currency";

type Props = {
  walletId: string;
};

function YearlyWalletPanel({ walletId }: Props) {
  const {
    calculatedEarnings,
    currency,
    fiatMode: fiatModeInState,
  } = useSelector((state: AppState) => {
    const currentPlanId = state.plans.current;
    return {
      ...state.general,
      calculatedEarnings: state.general.calculatedEarnings[currentPlanId],
      currency: state.settings[currentPlanId].currency,
    };
  });
  const { results: resultsContent } = useContext(ContentContext);

  const featureToggles = useContext(FeatureTogglesContext);

  const fiatMode =
    (featureToggles.dripFiatModeToggle && fiatModeInState) ||
    !featureToggles.dripFiatModeToggle;

  const earningsTuple = Object.entries(
    calculatedEarnings?.walletEarnings ?? {}
  ).find(([id]) => id === walletId);

  const walletEarnings = earningsTuple?.[1];

  const earningYears = Object.keys(walletEarnings?.yearEarnings ?? {}).map(
    (str) => Number.parseInt(str)
  );
  earningYears.sort((a, b) => a - b);

  return (
    <div className="wallet-tab-panel-container">
      <div className="wallet-tab-panel-inner-container block-bottom-lg">
        <div className="block block-bottom-lg">
          <HTMLTable className="results-table" striped>
            <thead>
              <th>{resultsContent.yearTableColumnLabel}</th>
              <th>
                <Tooltip2
                  content={resultsContent.dripDepositBalanceEndOfYearHelpText}
                  position={Position.BOTTOM}
                  openOnTargetFocus={false}
                >
                  {resultsContent.dripDepositBalanceEndOfYearLabel}
                </Tooltip2>
              </th>
              <th>
                <Tooltip2
                  content={resultsContent.yearEarningsHelpText}
                  position={Position.BOTTOM}
                  openOnTargetFocus={false}
                >
                  {resultsContent.yearEarningsLabel}
                </Tooltip2>
              </th>
              {fiatMode && (
                <th>
                  <Tooltip2
                    content={resultsContent.yearEarningsInCurrencyHelpText(
                      currency
                    )}
                    position={Position.BOTTOM}
                    openOnTargetFocus={false}
                  >
                    {resultsContent.yearEarningsInCurrencyLabel(currency)}
                  </Tooltip2>
                </th>
              )}
              <th>
                <Tooltip2
                  content={resultsContent.yearClaimedHelpText}
                  position={Position.BOTTOM}
                  openOnTargetFocus={false}
                >
                  {resultsContent.yearClaimedLabel}
                </Tooltip2>
              </th>
              {fiatMode && (
                <th>
                  <Tooltip2
                    content={resultsContent.yearClaimedInCurrencyHelpText(
                      currency
                    )}
                    position={Position.BOTTOM}
                    openOnTargetFocus={false}
                  >
                    {resultsContent.yearClaimedInCurrencyLabel(currency)}
                  </Tooltip2>
                </th>
              )}
              <th>
                <Tooltip2
                  content={resultsContent.accumClaimedHelpText}
                  position={Position.BOTTOM}
                  openOnTargetFocus={false}
                >
                  {resultsContent.accumClaimedLabel}
                </Tooltip2>
              </th>
              {fiatMode && (
                <th>
                  <Tooltip2
                    content={resultsContent.accumClaimedInCurrencyHelpText(
                      currency
                    )}
                    position={Position.BOTTOM}
                    openOnTargetFocus={false}
                  >
                    {resultsContent.accumClaimedInCurrencyLabel(currency)}
                  </Tooltip2>
                </th>
              )}
              <th>
                <Tooltip2
                  content={resultsContent.consumedRewardsHelpText}
                  position={Position.BOTTOM}
                  openOnTargetFocus={false}
                >
                  {resultsContent.consumedRewardsLabel}
                </Tooltip2>
              </th>
            </thead>
            <tbody>
              {earningYears.map((year) => {
                const yearEarnings = walletEarnings?.yearEarnings[year];

                const renderYear = () => {
                  return <strong>{year}</strong>;
                };

                const renderColumns = () => {
                  const monthKeys = Object.keys(
                    yearEarnings?.monthEarnings ?? {}
                  ).map((str) => Number.parseInt(str));
                  monthKeys.sort((a, b) => a - b);

                  const lastMonthEarnings =
                    yearEarnings?.monthEarnings[
                      monthKeys[monthKeys.length - 1]
                    ];
                  return (
                    <>
                      <td>{renderYear()}</td>
                      <td>
                        {lastMonthEarnings?.dripDepositBalanceEndOfMonth.toFixed(
                          4
                        )}
                      </td>
                      <td>{yearEarnings?.totalYearEarnings.toFixed(4)}</td>
                      {fiatMode && (
                        <td>
                          {formatCurrency(
                            currency,
                            yearEarnings?.totalYearEarningsInCurrency
                          )}
                        </td>
                      )}
                      <td>
                        {yearEarnings?.totalYearClaimedAfterTax.toFixed(4)}
                      </td>
                      {fiatMode && (
                        <td>
                          {formatCurrency(
                            currency,
                            yearEarnings?.totalYearClaimedInCurrency
                          )}
                        </td>
                      )}
                      <td>{lastMonthEarnings?.accumClaimed.toFixed(4)}</td>
                      {fiatMode && (
                        <td>
                          {formatCurrency(
                            currency,
                            lastMonthEarnings?.accumClaimedInCurrency
                          )}
                        </td>
                      )}
                      <td>
                        {lastMonthEarnings?.accumConsumedRewards.toFixed(4)}
                      </td>
                    </>
                  );
                };
                return <tr key={year}>{renderColumns()}</tr>;
              })}
            </tbody>
          </HTMLTable>
        </div>
      </div>
    </div>
  );
}

export default YearlyWalletPanel;
