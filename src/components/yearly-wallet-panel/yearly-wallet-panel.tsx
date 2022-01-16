import { Button, Collapse, HTMLTable, Position } from "@blueprintjs/core";
import { Cell, Column, Table2 } from "@blueprintjs/table";
import { useContext, useLayoutEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { AppState } from "../../store/types";

import ContentContext from "../../contexts/content";
import moment from "moment";
import { Tooltip2 } from "@blueprintjs/popover2";
import formatCurrency from "../../utils/currency";

type Props = {
  walletId: string;
};

function YearlyWalletPanel({ walletId }: Props) {
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

  return (
    <div className="wallet-tab-panel-container">
      <div className="wallet-tab-panel-inner-container block-bottom-lg">
        <div className="block block-bottom-lg">
          <HTMLTable className="results-table" striped>
            <thead>
              <th>{resultsContent.monthTableColumnLabel}</th>
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
              <th>
                <Tooltip2
                  content={resultsContent.yearClaimedHelpText}
                  position={Position.BOTTOM}
                  openOnTargetFocus={false}
                >
                  {resultsContent.yearClaimedLabel}
                </Tooltip2>
              </th>
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
                      <td>
                        {formatCurrency(
                          currency,
                          yearEarnings?.totalYearEarningsInCurrency
                        )}
                      </td>
                      <td>
                        {yearEarnings?.totalYearClaimedAfterTax.toFixed(4)}
                      </td>
                      <td>
                        {formatCurrency(
                          currency,
                          yearEarnings?.totalYearClaimedInCurrency
                        )}
                      </td>
                      <td>{lastMonthEarnings?.accumClaimed.toFixed(4)}</td>
                      <td>
                        {formatCurrency(
                          currency,
                          lastMonthEarnings?.accumClaimedInCurrency
                        )}
                      </td>
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

function determineRowClass(nextActions?: string): string {
  if (nextActions === "considerNewWallet") {
    return "warning";
  }

  if (nextActions === "newWalletRequired") {
    return "danger";
  }

  return "";
}

export default YearlyWalletPanel;
