import { Button, HTMLSelect, HTMLTable, Position } from "@blueprintjs/core";
import { useContext, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { AppState } from "../../store/types";

import ContentContext from "../../contexts/content";
import { Tooltip2 } from "@blueprintjs/popover2";
import moment, { Moment } from "moment";
import { DayEarnings } from "../../store/middleware/shared-calculator-types";
import usePrevious from "../../hooks/use-previous";
import ConfigContext from "../../contexts/config";
import {
  DayAction,
  DayActionValue,
  MonthInput,
} from "../../store/reducers/plans";

type Props = {
  walletId: string;
  onSaveActionForDayOverride: (
    timestamp: number,
    actionForDayValue: DayActionValue
  ) => void;
};

function HydrateClaimStrategyPanel({
  walletId,
  onSaveActionForDayOverride,
}: Props) {
  const config = useContext(ConfigContext);
  const [editActionOnDayStates, setEditActionOnDayStates] = useState<
    Record<string, boolean>
  >({});

  const { calculatedEarnings, monthInputs } = useSelector((state: AppState) => {
    const currentPlanId = state.plans.current;
    const currentPlan = state.plans.plans.find(
      ({ id }) => id === currentPlanId
    );
    const currentWallet = currentPlan?.wallets.find(
      ({ id }) => id === walletId
    );
    return {
      ...state.general,
      calculatedEarnings: state.general.calculatedEarnings[currentPlanId],
      currency: state.settings[currentPlanId].currency,
      monthInputs: currentWallet?.monthInputs,
    };
  });
  const { results: resultsContent } = useContext(ContentContext);

  const [customActionOnDayValues, setCustomActionOnDayValues] = useState<
    Record<string, DayActionValue>
  >(
    Object.entries(monthInputs ?? {}).reduce(
      (accum, [_monthInputKey, monthInput]) => {
        return (monthInput.customDayActions ?? []).reduce(
          (customActionDaysAccum, dayAction) => {
            return {
              ...customActionDaysAccum,
              [`${dayAction.timestamp}`]: dayAction.action,
            };
          },
          accum
        );
      },
      {} as Record<string, DayActionValue>
    )
  );

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

  const [monthOptions, setMonthOptions] = useState(
    earningMonths.map((month): [number, string] => [month, monthLabels[month]])
  );

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
    if (!currentYear) {
      setCurrentYear(earningYears[0]);
    }
  }, [calculatedEarnings, earningYears, currentYear]);

  useEffect(() => {
    if (currentYear !== prevCurrentYear) {
      const newMonthOptions = earningMonths.map((month): [number, string] => [
        month,
        monthLabels[month],
      ]);
      setMonthOptions(newMonthOptions);
      setCurrentMonth(newMonthOptions?.[0]?.[0] ?? 0);
    }
  }, [currentYear, prevCurrentYear, setCurrentMonth, earningMonths]);

  const handleEditActionOnDayClick: (date: Moment) => React.MouseEventHandler =
    (date) => (evt) => {
      evt.preventDefault();
      setEditActionOnDayStates((prevState) => ({
        ...prevState,
        [date.format("x")]: true,
      }));
    };

  const handleSaveActionOnDayClick: (date: Moment) => React.MouseEventHandler =
    (date) => (evt) => {
      evt.preventDefault();
      const dateTimestamp = date.format("x");
      onSaveActionForDayOverride(
        Number.parseInt(dateTimestamp),
        customActionOnDayValues[dateTimestamp]
      );
      setEditActionOnDayStates((prevState) => ({
        ...prevState,
        [dateTimestamp]: false,
      }));
    };

  const handleDiscardActionOnDayClick: (
    date: Moment
  ) => React.MouseEventHandler = (date) => (evt) => {
    evt.preventDefault();
    setEditActionOnDayStates((prevState) => ({
      ...prevState,
      [date.format("x")]: false,
    }));
    // Reset value for day.
    setCustomActionOnDayValues((prevState) => {
      const dateTimestamp = date.format("x");
      return {
        ...prevState,
        [dateTimestamp]:
          findUserInputDayAction(
            currentMonth + 1,
            currentYear,
            Number.parseInt(dateTimestamp),
            monthInputs
          )?.action ?? "automatic",
      };
    });
  };

  const handleSelectDayAction: (
    date: Moment
  ) => React.ChangeEventHandler<HTMLSelectElement> = (date) => (evt) => {
    evt.preventDefault();
    setCustomActionOnDayValues((prevState) => ({
      ...prevState,
      [date.format("x")]: evt.currentTarget.value as DayActionValue,
    }));
  };

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

                  const date = moment(
                    `${day}/${currentMonth + 1}/${currentYear}`,
                    "D/M/YYYY"
                  );
                  const dateTimestamp = date.format("x");
                  const renderDay = () => {
                    return <strong>{date.format("dddd Do")}</strong>;
                  };

                  const renderColumns = () => {
                    const accumDailyRewards =
                      dayEarnings?.accumDailyRewards ?? 0;
                    const maxPayout = (
                      (dayEarnings?.dripDepositBalance ?? 0) *
                      config.depositMultiplier
                    ).toFixed(4);
                    const consumedRewards = (
                      dayEarnings?.accumConsumedRewards ?? 0
                    ).toFixed(4);
                    const hydrateOnDay = dayEarnings?.reinvestAfterTax;
                    const claimOnDay = dayEarnings?.claimAfterTax;
                    // Day earnings will reflect custom overrides if a user has provided
                    // specific day actions.
                    const actionForDayLabel = selectActionForDay(dayEarnings);
                    const dayAction = findUserInputDayAction(
                      currentMonth + 1,
                      currentYear,
                      Number.parseInt(dateTimestamp),
                      monthInputs
                    );

                    return (
                      <>
                        <td>{renderDay()}</td>
                        <td>
                          {!editActionOnDayStates[dateTimestamp] && (
                            <>
                              {actionForDayLabel}
                              <span className="left-small-margin">
                                <Tooltip2
                                  content="Override action for day"
                                  position={Position.BOTTOM}
                                  openOnTargetFocus={false}
                                >
                                  <Button
                                    icon="edit"
                                    small
                                    onClick={handleEditActionOnDayClick(date)}
                                  />
                                </Tooltip2>
                              </span>
                            </>
                          )}
                          {editActionOnDayStates[dateTimestamp] && (
                            <>
                              <HTMLSelect
                                id={`day-action-${dateTimestamp}-select`}
                                className="select-in-table"
                                value={
                                  customActionOnDayValues[dateTimestamp] ??
                                  dayAction?.action ??
                                  "automatic"
                                }
                                onChange={handleSelectDayAction(date)}
                              >
                                {Object.entries(dayActionOptions).map(
                                  ([key, label]) => (
                                    <option key={`${key}`} value={`${key}`}>
                                      {label}
                                    </option>
                                  )
                                )}
                              </HTMLSelect>
                              <span className="left-small-margin">
                                <Tooltip2
                                  content="Save action for day"
                                  position={Position.BOTTOM}
                                  openOnTargetFocus={false}
                                >
                                  <Button
                                    icon="tick"
                                    small
                                    onClick={handleSaveActionOnDayClick(date)}
                                  />
                                </Tooltip2>
                              </span>
                              <span className="left-xs-margin">
                                <Tooltip2
                                  content="Discard changes"
                                  position={Position.BOTTOM}
                                  openOnTargetFocus={false}
                                >
                                  <Button
                                    icon="cross"
                                    small
                                    onClick={handleDiscardActionOnDayClick(
                                      date
                                    )}
                                  />
                                </Tooltip2>
                              </span>
                            </>
                          )}
                        </td>
                        {actionForDayLabel === "Hydrate" && (
                          <td>{hydrateOnDay?.toFixed(4)}</td>
                        )}
                        {actionForDayLabel === "Claim" && (
                          <td>{claimOnDay?.toFixed(4)}</td>
                        )}
                        {(actionForDayLabel === "Unknown" ||
                          actionForDayLabel ===
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

function findUserInputDayAction(
  currentMonth: number,
  currentYear: number,
  dateTimestamp: number,
  monthInputs?: Record<string, MonthInput>
): DayAction | undefined {
  return monthInputs?.[
    `01/${currentMonth}/${currentYear}`
  ]?.customDayActions?.find(({ timestamp }) => timestamp === dateTimestamp);
}

const dayActionOptions = {
  automatic: "Automatic - Calculate Based on Settings",
  hydrate: "Hydrate",
  claim: "Claim",
  accumAvailable: "Leave to Accumulate in Available Rewards",
};

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
