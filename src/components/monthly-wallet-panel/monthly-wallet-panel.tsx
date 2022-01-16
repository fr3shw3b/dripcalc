import { Button, Collapse, HTMLTable, Position } from "@blueprintjs/core";
import { useContext, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { AppState } from "../../store/types";

import ContentContext from "../../contexts/content";
import moment from "moment";
import { Tooltip2 } from "@blueprintjs/popover2";
import formatCurrency from "../../utils/currency";

type Props = {
  walletId: string;
};

function MonthlyWalletPanel({ walletId }: Props) {
  const { calculatedEarnings, currency } = useSelector((state: AppState) => ({
    ...state.general,
    currency: state.settings.currency,
  }));
  const { results: resultsContent } = useContext(ContentContext);

  const earningsTuple = Object.entries(
    calculatedEarnings?.walletEarnings ?? {}
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
      calculatedEarnings?.walletEarnings ?? {}
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
    <div className="wallet-tab-panel-container">
      <div className="wallet-tab-panel-inner-container block-bottom-lg">
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
                            resultsContent.dripDepositBalanceEndOfMonthHelpText
                          }
                          position={Position.BOTTOM}
                          openOnTargetFocus={false}
                        >
                          {resultsContent.dripDepositBalanceEndOfMonthLabel}
                        </Tooltip2>
                      </th>
                      <th>
                        <Tooltip2
                          content={resultsContent.earningsMonthHelpText}
                          position={Position.BOTTOM}
                          openOnTargetFocus={false}
                        >
                          {resultsContent.earningsMonthLabel}
                        </Tooltip2>
                      </th>
                      <th>
                        <Tooltip2
                          content={resultsContent.earningsMonthInCurrencyHelpText(
                            currency
                          )}
                          position={Position.BOTTOM}
                          openOnTargetFocus={false}
                        >
                          {resultsContent.earningsMonthInCurrencyLabel(
                            currency
                          )}
                        </Tooltip2>
                      </th>
                      <th>
                        <Tooltip2
                          content={resultsContent.reinvestMonthHelpText}
                          position={Position.BOTTOM}
                          openOnTargetFocus={false}
                        >
                          {resultsContent.reinvestMonthLabel}
                        </Tooltip2>
                      </th>
                      <th>
                        <Tooltip2
                          content={resultsContent.reinvestMonthInCurrencyHelpText(
                            currency
                          )}
                          position={Position.BOTTOM}
                          openOnTargetFocus={false}
                        >
                          {resultsContent.reinvestMonthInCurrencyLabel(
                            currency
                          )}
                        </Tooltip2>
                      </th>
                      <th>
                        <Tooltip2
                          content={resultsContent.claimMonthHelpText}
                          position={Position.BOTTOM}
                          openOnTargetFocus={false}
                        >
                          {resultsContent.claimMonthLabel}
                        </Tooltip2>
                      </th>
                      <th>
                        <Tooltip2
                          content={resultsContent.claimMonthInCurrencyHelpText(
                            currency
                          )}
                          position={Position.BOTTOM}
                          openOnTargetFocus={false}
                        >
                          {resultsContent.claimMonthInCurrencyLabel(currency)}
                        </Tooltip2>
                      </th>
                      <th>
                        <Tooltip2
                          content={resultsContent.accumClaimedHelpText}
                          position={Position.BOTTOM}
                          openOnTargetFocus={false}
                        >
                          {resultsContent.accumClaimedLabel}
                        </Tooltip2>
                      </th>
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
                              <td>
                                {monthEarnings?.nextActions &&
                                  monthEarnings?.nextActions !==
                                    "keepCompounding" && (
                                    <Tooltip2
                                      content={
                                        monthEarnings?.nextActions ===
                                        "considerNewWallet"
                                          ? resultsContent.considerNewWalletText
                                          : resultsContent.newWalletRequiredText
                                      }
                                      position={Position.BOTTOM}
                                      openOnTargetFocus={false}
                                    >
                                      {renderMonth()}
                                    </Tooltip2>
                                  )}
                                {(!monthEarnings?.nextActions ||
                                  monthEarnings?.nextActions ===
                                    "keepCompounding") &&
                                  renderMonth()}
                              </td>
                              <td>
                                {monthEarnings?.dripDepositBalanceEndOfMonth.toFixed(
                                  4
                                )}
                              </td>
                              <td>{monthEarnings?.monthEarnings.toFixed(4)}</td>
                              <td>
                                {formatCurrency(
                                  currency,
                                  monthEarnings?.monthEarningsInCurrency
                                )}
                              </td>
                              <td>
                                {monthEarnings?.monthReinvestedAfterTax.toFixed(
                                  4
                                )}
                              </td>
                              <td>
                                {formatCurrency(
                                  currency,
                                  monthEarnings?.monthReinvestedInCurrency
                                )}
                              </td>
                              <td>
                                {monthEarnings?.monthClaimedAfterTax.toFixed(4)}
                              </td>
                              <td>
                                {formatCurrency(
                                  currency,
                                  monthEarnings?.monthClaimedInCurrency
                                )}
                              </td>
                              <td>{monthEarnings?.accumClaimed.toFixed(4)}</td>
                              <td>
                                {formatCurrency(
                                  currency,
                                  monthEarnings?.accumClaimedInCurrency
                                )}
                              </td>
                              <td>
                                {formatCurrency(
                                  currency,
                                  monthEarnings?.monthEstimatedGasFees
                                )}
                              </td>
                              <td>
                                {monthEarnings?.accumConsumedRewards.toFixed(4)}
                              </td>
                            </>
                          );
                        };
                        return (
                          <tr
                            className={determineRowClass(
                              monthEarnings?.nextActions
                            )}
                            key={`${walletId}-${year}-${month}`}
                          >
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

function determineRowClass(nextActions?: string): string {
  if (nextActions === "considerNewWallet") {
    return "warning";
  }

  if (nextActions === "newWalletRequired") {
    return "danger";
  }

  return "";
}

export default MonthlyWalletPanel;
