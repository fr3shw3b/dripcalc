import { Button, Collapse, HTMLTable, Position } from "@blueprintjs/core";
import { useContext, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { AppState } from "../../store/types";

import ContentContext from "../../contexts/content";
import FeatureTogglesContext from "../../contexts/feature-toggles";
import moment from "moment";
import { Tooltip2 } from "@blueprintjs/popover2";
import formatCurrency from "../../utils/currency";

type Props = {
  walletId: string;
};

function GardenMonthlyWalletPanel({ walletId }: Props) {
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
    calculatedEarnings?.gardenEarnings?.walletEarnings ?? {}
  ).find(([id]) => id === walletId);

  const walletEarnings = earningsTuple?.[1];

  const earningYears = Object.keys(walletEarnings?.yearEarnings ?? {}).map(
    (str) => Number.parseInt(str)
  );
  earningYears.sort((a, b) => a - b);

  const openStatesSeed: Record<number, boolean> = {};
  const [openStates, setOpenStates] = useState<Record<number, boolean>>(
    // Make sure the first min(10, earningYears.length) are open by default.
    [...Array(Math.min(10, earningYears.length))]
      .map((_, i) => earningYears[i])
      .reduce((openStates, year) => {
        return {
          ...openStates,
          [year]: true,
        };
      }, openStatesSeed)
  );

  useEffect(() => {
    // TODO: refactor to reduce code duplication!
    // Make sure to expand all year tables if the monthly wallet panel
    // was loaded before calculations completed.
    const earningsTuple = Object.entries(
      calculatedEarnings?.gardenEarnings?.walletEarnings ?? {}
    ).find(([id]) => id === walletId);

    const walletEarnings = earningsTuple?.[1];

    const earningYears = Object.keys(walletEarnings?.yearEarnings ?? {}).map(
      (str) => Number.parseInt(str)
    );
    earningYears.sort((a, b) => a - b);

    const openStatesSeed: Record<number, boolean> = {};
    setOpenStates(
      // Make sure the first min(10, earningYears.length) are open by default.
      [...Array(Math.min(10, earningYears.length))]
        .map((_, i) => earningYears[i])
        .reduce((openStates, year) => {
          return {
            ...openStates,
            [year]: true,
          };
        }, openStatesSeed)
    );
  }, [setOpenStates, calculatedEarnings, walletId]);

  const handleYearToggleClick: (year: number) => React.MouseEventHandler =
    (year) => (evt) => {
      evt.preventDefault();
      setOpenStates((prevState) => ({
        ...prevState,
        [year]: !prevState[year],
      }));
    };

  return (
    <div className="wallet-tab-panel-container garden">
      <div className="wallet-tab-panel-inner-container garden block-bottom-lg">
        {earningYears.map((year) => {
          const yearEarnings = walletEarnings?.yearEarnings[year];

          const monthEarningKeys = Object.keys(
            yearEarnings?.monthEarnings ?? {}
          ).map((str) => Number.parseInt(str));
          monthEarningKeys.sort((a, b) => a - b);

          return (
            <div className="block" key={`${walletId}-${year}`}>
              <h3>{year}</h3>
              <Button onClick={handleYearToggleClick(year)}>
                {openStates[year] ? "Hide" : "Show"} {year}
              </Button>
              <Collapse isOpen={openStates[year]}>
                <div className="block block-bottom-lg">
                  <HTMLTable className="results-table" striped>
                    <thead>
                      <th>{resultsContent.monthTableColumnLabel}</th>
                      <th>
                        <Tooltip2
                          content={
                            resultsContent.gardenPlantBalanceEndOfMonthHelpText
                          }
                          position={Position.BOTTOM}
                          openOnTargetFocus={false}
                        >
                          {resultsContent.gardenPlantBalanceEndOfMonthLabel}
                        </Tooltip2>
                      </th>
                      <th>
                        <Tooltip2
                          content={resultsContent.seedsPerDayEndOfMonthHelpText}
                          position={Position.BOTTOM}
                          openOnTargetFocus={false}
                        >
                          {resultsContent.seedsPerDayEndOfMonthLabel}
                        </Tooltip2>
                      </th>
                      <th>
                        <Tooltip2
                          content={
                            resultsContent.gardenEarningsMonthInDripBUSDLPHelpText
                          }
                          position={Position.BOTTOM}
                          openOnTargetFocus={false}
                        >
                          {resultsContent.gardenEarningsMonthInDripBUSDLPLabel}
                        </Tooltip2>
                      </th>
                      {fiatMode && (
                        <th>
                          <Tooltip2
                            content={resultsContent.gardenEarningsMonthInCurrencyHelpText(
                              currency
                            )}
                            position={Position.BOTTOM}
                            openOnTargetFocus={false}
                          >
                            {resultsContent.gardenEarningsMonthInCurrencyLabel(
                              currency
                            )}
                          </Tooltip2>
                        </th>
                      )}
                      <th>
                        <Tooltip2
                          content={
                            resultsContent.gardenReinvestMonthDripBUSDLPHelpText
                          }
                          position={Position.BOTTOM}
                          openOnTargetFocus={false}
                        >
                          {resultsContent.gardenReinvestMonthDripBUSDLPLabel}
                        </Tooltip2>
                      </th>
                      {fiatMode && (
                        <th>
                          <Tooltip2
                            content={resultsContent.gardenReinvestMonthInCurrencyHelpText(
                              currency
                            )}
                            position={Position.BOTTOM}
                            openOnTargetFocus={false}
                          >
                            {resultsContent.gardenReinvestMonthInCurrencyLabel(
                              currency
                            )}
                          </Tooltip2>
                        </th>
                      )}
                      <th>
                        <Tooltip2
                          content={
                            resultsContent.gardenClaimMonthDripBUSDLPHelpText
                          }
                          position={Position.BOTTOM}
                          openOnTargetFocus={false}
                        >
                          {resultsContent.gardenClaimMonthDripBUSDLPLabel}
                        </Tooltip2>
                      </th>
                      {fiatMode && (
                        <th>
                          <Tooltip2
                            content={resultsContent.gardenClaimMonthInCurrencyHelpText(
                              currency
                            )}
                            position={Position.BOTTOM}
                            openOnTargetFocus={false}
                          >
                            {resultsContent.gardenClaimMonthInCurrencyLabel(
                              currency
                            )}
                          </Tooltip2>
                        </th>
                      )}
                      <th>
                        <Tooltip2
                          content={
                            resultsContent.gardenLostSeedsInMonthHelpText
                          }
                          position={Position.BOTTOM}
                          openOnTargetFocus={false}
                        >
                          {resultsContent.gardenLostSeedsInMonthLabel}
                        </Tooltip2>
                      </th>
                      {fiatMode && (
                        <th>
                          <Tooltip2
                            content={resultsContent.gardenLostSeedsInMonthInCurrencyHelpText(
                              currency
                            )}
                            position={Position.BOTTOM}
                            openOnTargetFocus={false}
                          >
                            {resultsContent.gardenLostSeedsInMonthInCurrencyLabel(
                              currency
                            )}
                          </Tooltip2>
                        </th>
                      )}
                      <th>
                        <Tooltip2
                          content={resultsContent.estimatedGasFeesMonthInCurrencyHelpText(
                            currency
                          )}
                          position={Position.BOTTOM}
                          openOnTargetFocus={false}
                        >
                          {resultsContent.estimatedGasFeesMonthInCurrencyLabel(
                            currency
                          )}
                        </Tooltip2>
                      </th>
                    </thead>
                    <tbody>
                      {monthEarningKeys.map((month) => {
                        const monthEarnings =
                          yearEarnings?.monthEarnings?.[month];

                        const renderMonth = () => {
                          return (
                            <strong>
                              {moment(
                                new Date(monthEarnings?.month ?? 0)
                              ).format("MMMM")}
                            </strong>
                          );
                        };

                        const renderColumns = () => {
                          return (
                            <>
                              <td>{renderMonth()}</td>
                              <td>
                                {Intl.NumberFormat("en-US", {
                                  notation: "compact",
                                  maximumFractionDigits: 1,
                                }).format(
                                  monthEarnings?.plantBalanceEndOfMonth ?? 0
                                )}
                              </td>
                              <td>
                                {Intl.NumberFormat("en-US", {
                                  notation: "compact",
                                  maximumFractionDigits: 1,
                                }).format(
                                  monthEarnings?.seedsPerDayEndOfMonth ?? 0
                                )}
                              </td>
                              <td>
                                {monthEarnings?.monthEarningsInDripBUSDLP.toFixed(
                                  4
                                )}
                              </td>
                              {fiatMode && (
                                <td>
                                  {formatCurrency(
                                    currency,
                                    monthEarnings?.monthEarningsInCurrency
                                  )}
                                </td>
                              )}
                              <td>
                                {monthEarnings?.monthReinvestedInDripBUSDLP.toFixed(
                                  4
                                )}
                              </td>
                              {fiatMode && (
                                <td>
                                  {formatCurrency(
                                    currency,
                                    monthEarnings?.monthReinvestedInCurrency
                                  )}
                                </td>
                              )}
                              <td>
                                {monthEarnings?.monthClaimedInDripBUSDLP.toFixed(
                                  4
                                )}
                              </td>
                              {fiatMode && (
                                <td>
                                  {formatCurrency(
                                    currency,
                                    monthEarnings?.monthClaimedInCurrency
                                  )}
                                </td>
                              )}
                              <td>
                                {Intl.NumberFormat("en-US", {
                                  notation: "compact",
                                  maximumFractionDigits: 1,
                                }).format(
                                  monthEarnings?.seedsLostForMonth ?? 0
                                )}
                              </td>
                              {fiatMode && (
                                <td>
                                  {formatCurrency(
                                    currency,
                                    monthEarnings?.seedsLostForMonthInCurrency
                                  )}
                                </td>
                              )}
                              <td>
                                {formatCurrency(
                                  currency,
                                  monthEarnings?.monthEstimatedGasFees
                                )}
                              </td>
                            </>
                          );
                        };
                        return (
                          <tr key={`${walletId}-${year}-${month}`}>
                            {renderColumns()}
                          </tr>
                        );
                      })}
                    </tbody>
                  </HTMLTable>
                </div>
              </Collapse>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default GardenMonthlyWalletPanel;
