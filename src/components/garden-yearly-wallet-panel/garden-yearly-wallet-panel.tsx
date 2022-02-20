import { HTMLTable, Position } from "@blueprintjs/core";
import { useContext } from "react";
import { useSelector } from "react-redux";
import { AppState } from "../../store/types";

import ContentContext from "../../contexts/content";
import { Tooltip2 } from "@blueprintjs/popover2";
import formatCurrency from "../../utils/currency";

type Props = {
  walletId: string;
};

function GardenYearlyWalletPanel({ walletId }: Props) {
  const { calculatedEarnings, currency } = useSelector((state: AppState) => {
    const currentPlanId = state.plans.current;
    return {
      ...state.general,
      calculatedEarnings: state.general.calculatedEarnings[currentPlanId],
      currency: state.settings[currentPlanId].currency,
    };
  });
  const { results: resultsContent } = useContext(ContentContext);

  const earningsTuple = Object.entries(
    calculatedEarnings?.gardenEarnings?.walletEarnings ?? {}
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
                  content={resultsContent.gardenPlantBalanceEndOfYearHelpText}
                  position={Position.BOTTOM}
                  openOnTargetFocus={false}
                >
                  {resultsContent.gardenPlantBalanceEndOfYearLabel}
                </Tooltip2>
              </th>
              <th>
                <Tooltip2
                  content={resultsContent.gardenSeedsPerDayEndOfYearHelpText}
                  position={Position.BOTTOM}
                  openOnTargetFocus={false}
                >
                  {resultsContent.gardenSeedsPerDayEndOfYearLabel}
                </Tooltip2>
              </th>
              <th>
                <Tooltip2
                  content={resultsContent.gardenYearEarningsHelpText}
                  position={Position.BOTTOM}
                  openOnTargetFocus={false}
                >
                  {resultsContent.gardenYearEarningsLabel}
                </Tooltip2>
              </th>
              <th>
                <Tooltip2
                  content={resultsContent.gardenYearEarningsInCurrencyHelpText(
                    currency
                  )}
                  position={Position.BOTTOM}
                  openOnTargetFocus={false}
                >
                  {resultsContent.gardenYearEarningsInCurrencyLabel(currency)}
                </Tooltip2>
              </th>
              <th>
                <Tooltip2
                  content={resultsContent.gardenYearClaimedHelpText}
                  position={Position.BOTTOM}
                  openOnTargetFocus={false}
                >
                  {resultsContent.gardenYearClaimedLabel}
                </Tooltip2>
              </th>
              <th>
                <Tooltip2
                  content={resultsContent.gardenYearClaimedInCurrencyHelpText(
                    currency
                  )}
                  position={Position.BOTTOM}
                  openOnTargetFocus={false}
                >
                  {resultsContent.gardenYearClaimedInCurrencyLabel(currency)}
                </Tooltip2>
              </th>
              <th>
                <Tooltip2
                  content={resultsContent.gardenYearAccumClaimedHelpText}
                  position={Position.BOTTOM}
                  openOnTargetFocus={false}
                >
                  {resultsContent.gardenYearAccumClaimedLabel}
                </Tooltip2>
              </th>
              <th>
                <Tooltip2
                  content={resultsContent.gardenYearAccumClaimedInCurrencyHelpText(
                    currency
                  )}
                  position={Position.BOTTOM}
                  openOnTargetFocus={false}
                >
                  {resultsContent.gardenYearAccumClaimedInCurrencyLabel(
                    currency
                  )}
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
                  return (
                    <>
                      <td>{renderYear()}</td>
                      <td>
                        {Intl.NumberFormat("en-US", {
                          notation: "compact",
                          maximumFractionDigits: 1,
                        }).format(yearEarnings?.plantBalanceEndOfYear ?? 0)}
                      </td>
                      <td>
                        {Intl.NumberFormat("en-US", {
                          notation: "compact",
                          maximumFractionDigits: 1,
                        }).format(yearEarnings?.seedsPerDayEndOfYear ?? 0)}
                      </td>
                      <td>
                        {Intl.NumberFormat("en-US", {
                          notation: "compact",
                          maximumFractionDigits: 1,
                        }).format(
                          yearEarnings?.totalYearEarningsInDripBUSDLP ?? 0
                        )}
                      </td>
                      <td>
                        {formatCurrency(
                          currency,
                          yearEarnings?.totalYearEarningsInCurrency
                        )}
                      </td>
                      <td>
                        {Intl.NumberFormat("en-US", {
                          notation: "compact",
                          maximumFractionDigits: 1,
                        }).format(
                          yearEarnings?.totalYearHarvestedInDripBUSDLP ?? 0
                        )}
                      </td>
                      <td>
                        {formatCurrency(
                          currency,
                          yearEarnings?.totalYearHarvestedInCurrency
                        )}
                      </td>
                      <td>
                        {Intl.NumberFormat("en-US", {
                          notation: "compact",
                          maximumFractionDigits: 1,
                        }).format(
                          yearEarnings?.accumYearHarvestedInDripBUSDLP ?? 0
                        )}
                      </td>
                      <td>
                        {formatCurrency(
                          currency,
                          yearEarnings?.accumYearHarvestedInCurrency
                        )}
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

export default GardenYearlyWalletPanel;
