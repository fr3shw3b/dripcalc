import { HTMLSelect, HTMLTable, Position } from "@blueprintjs/core";
import { useContext, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { AppState } from "../../store/types";

import ContentContext from "../../contexts/content";
import { Tooltip2 } from "@blueprintjs/popover2";
import moment from "moment";
import { DayEarnings } from "../../store/middleware/shared-calculator-types";
import usePrevious from "../../hooks/use-previous";
import ConfigContext from "../../contexts/config";

type Props = {
  walletId: string;
};

function HydrateClaimStrategyPanel({ walletId }: Props) {
  const config = useContext(ConfigContext);
  const { calculatedEarnings } = useSelector((state: AppState) => {
    const currentPlanId = state.plans.current;
    return {
      ...state.general,
      calculatedEarnings: state.general.calculatedEarnings[currentPlanId],
      currency: state.settings[currentPlanId].currency,
    };
  });
  const { results: resultsContent } = useContext(ContentContext);

  const earningsTuple = Object.entries(
    calculatedEarnings?.walletEarnings ?? {}
  ).find(([id]) => id === walletId);

  const walletEarnings = earningsTuple?.[1];

  const earningYears = Object.keys(walletEarnings?.yearEarnings ?? {}).map(
    (str) => Number.parseInt(str)
  );
  earningYears.sort((a, b) => a - b);

  const [currentYear, setCurrentYear] = useState(earningYears[0]);

  const handleSelectYear: React.ChangeEventHandler<HTMLSelectElement> = (
    evt
  ) => {
    evt.preventDefault();
    setCurrentYear(Number.parseInt(evt.currentTarget.value));
  };

  const earningMonths = Object.keys(
    walletEarnings?.yearEarnings[currentYear]?.monthEarnings ?? {}
  ).map((str) => Number.parseInt(str));

  const monthOptions = earningMonths.map((month): [number, string] => [
    month,
    monthLabels[month],
  ]);

  const [currentMonth, setCurrentMonth] = useState(monthOptions?.[0]?.[0] ?? 0);

  const earningDays = Object.keys(
    walletEarnings?.yearEarnings[currentYear]?.monthEarnings[currentMonth]
      ?.dayEarnings ?? {}
  ).map((str) => Number.parseInt(str));

  const handleSelectMonth: React.ChangeEventHandler<HTMLSelectElement> = (
    evt
  ) => {
    evt.preventDefault();
    setCurrentMonth(Number.parseInt(evt.currentTarget.value));
  };

  const prevCurrentYear = usePrevious(currentYear);

  useEffect(() => {
    if (currentYear !== prevCurrentYear) {
      setCurrentMonth(monthOptions[0][0]);
    }
  }, [currentYear, prevCurrentYear, setCurrentMonth, monthOptions]);

  return (
    <div>
      <div className="hydrate-strategy-year-month-select-block">
        <HTMLSelect
          id="hydrate-strategy-year-select"
          value={currentYear}
          onChange={handleSelectYear}
        >
          {earningYears.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </HTMLSelect>
        <HTMLSelect
          id="hydrate-strategy-month-select"
          className="left-small-margin"
          value={currentMonth}
          onChange={handleSelectMonth}
        >
          {monthOptions.map(([month, label]) => (
            <option key={`${month}`} value={`${month}`}>
              {label}
            </option>
          ))}
        </HTMLSelect>
      </div>
      <div className="hydrate-claim-strategy-tab-panel-container">
        <div className="hydrate-claim-strategy-tab-panel-inner-container block-bottom-lg">
          <div className="block block-bottom-lg">
            <HTMLTable className="results-table" striped>
              <thead>
                <th>{resultsContent.dayTableColumnLabel}</th>
                <th>
                  <Tooltip2
                    content={resultsContent.hydrateClaimActionColumnHelpText}
                    position={Position.BOTTOM}
                    openOnTargetFocus={false}
                  >
                    {resultsContent.hydrateClaimActionColumnLabel}
                  </Tooltip2>
                </th>
                <th>
                  <Tooltip2
                    content={
                      resultsContent.hydrateClaimClaimedOrHydratedHelpText
                    }
                    position={Position.BOTTOM}
                    openOnTargetFocus={false}
                  >
                    {resultsContent.hydrateClaimClaimedOrHydratedLabel}
                  </Tooltip2>
                </th>
                <th>
                  <Tooltip2
                    content={
                      resultsContent.hydrateClaimAccumDripRewardsHelpText
                    }
                    position={Position.BOTTOM}
                    openOnTargetFocus={false}
                  >
                    {resultsContent.hydrateClaimAccumDripRewardsLabel}
                  </Tooltip2>
                </th>
                <th>
                  <Tooltip2
                    content={
                      resultsContent.hydrateClaimConsumedRewardsEndOfDayHelpText
                    }
                    position={Position.BOTTOM}
                    openOnTargetFocus={false}
                  >
                    {resultsContent.hydrateClaimConsumedRewardsEndOfDayLabel}
                  </Tooltip2>
                </th>
                <th>
                  <Tooltip2
                    content={
                      resultsContent.hydrateClaimMaxPayoutEndOfDayHelpText
                    }
                    position={Position.BOTTOM}
                    openOnTargetFocus={false}
                  >
                    {resultsContent.hydrateClaimMaxPayoutEndOfDayLabel}
                  </Tooltip2>
                </th>
              </thead>
              <tbody>
                {earningDays.map((day) => {
                  const dayEarnings =
                    walletEarnings?.yearEarnings[currentYear]?.monthEarnings[
                      currentMonth
                    ]?.dayEarnings[day];

                  const renderDay = () => {
                    return (
                      <strong>
                        {moment(
                          `${day}/${currentMonth + 1}/${currentYear}`,
                          "D/M/YYYY"
                        ).format("dddd Do")}
                      </strong>
                    );
                  };

                  const renderColumns = () => {
                    const accumDailyRewards =
                      dayEarnings?.accumDailyRewards ?? 0;
                    const maxPayout = (
                      dayEarnings?.dripDepositBalance ??
                      0 * config.depositMultiplier
                    ).toFixed(4);
                    const consumedRewards = (
                      dayEarnings?.accumConsumedRewards ?? 0
                    ).toFixed(4);
                    const hydrateOnDay = dayEarnings?.reinvestAfterTax;
                    const claimOnDay = dayEarnings?.claimAfterTax;
                    const actionForDay = selectActionForDay(dayEarnings);
                    return (
                      <>
                        <td>{renderDay()}</td>
                        <td>{actionForDay}</td>
                        {actionForDay === "Hydrate" && (
                          <td>{hydrateOnDay?.toFixed(4)}</td>
                        )}
                        {actionForDay === "Claim" && (
                          <td>{claimOnDay?.toFixed(4)}</td>
                        )}
                        {(actionForDay === "Unknown" ||
                          actionForDay ===
                            "Leave to Accumulate in Available Rewards") && (
                          <td></td>
                        )}
                        <td>
                          {accumDailyRewards > 0
                            ? accumDailyRewards.toFixed(4)
                            : ""}
                        </td>
                        <td>{consumedRewards}</td>
                        <td>{maxPayout}</td>
                      </>
                    );
                  };
                  return <tr key={day}>{renderColumns()}</tr>;
                })}
              </tbody>
            </HTMLTable>
          </div>
        </div>
      </div>
    </div>
  );
}

function selectActionForDay(dayEarnings?: DayEarnings): string {
  if (!dayEarnings) {
    return "Unknown";
  }

  if (dayEarnings.isHydrateDay) {
    return "Hydrate";
  }

  if (dayEarnings.isClaimDay) {
    return "Claim";
  }

  return "Leave to Accumulate in Available Rewards";
}

const monthLabels = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default HydrateClaimStrategyPanel;
