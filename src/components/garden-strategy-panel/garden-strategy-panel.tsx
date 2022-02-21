import { Button, HTMLSelect, HTMLTable, Position } from "@blueprintjs/core";
import { useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppState } from "../../store/types";

import ContentContext from "../../contexts/content";
import { Tooltip2 } from "@blueprintjs/popover2";
import moment, { Moment } from "moment";
import {
  EarningsAndInfo,
  GardenDayEarnings,
} from "../../store/middleware/shared-calculator-types";
import usePrevious from "../../hooks/use-previous";
import {
  DayActionValue,
  GardenDayAction,
  MonthInput,
} from "../../store/reducers/plans";
import GardenDaySchedule from "../garden-day-schedule";
import { updateWalletMonthInputs } from "../../store/actions/plans";
import { GeneralState } from "../../store/reducers/general";

type Props = {
  walletId: string;
  onSaveActionForDayOverride: (
    timestamp: number,
    actionForDayValue: DayActionValue
  ) => void;
};

type DayScheduleState = {
  isDayScheduleDialogOpen: boolean;
  dayScheduleForCurrentDay: GardenDayAction[];
  currentDayEarnings?: GardenDayEarnings;
  currentDate?: Moment;
};

type StoreStateForGardenStrategy = Omit<GeneralState, "calculatedEarnings"> & {
  calculatedEarnings?: EarningsAndInfo;
  currency: string;
  monthInputs?: Record<string, MonthInput>;
  currentPlanId: string;
  currentWalletLabel: string;
};

function GardenStrategyPanel({ walletId }: Props) {
  const dispatch = useDispatch();
  const { calculatedEarnings, monthInputs, currentPlanId, currentWalletLabel } =
    useSelector((state: AppState): StoreStateForGardenStrategy => {
      const currentPlanIdInSelector = state.plans.current;
      const currentPlan = state.plans.plans.find(
        ({ id }) => id === currentPlanIdInSelector
      );
      const currentWallet = currentPlan?.wallets.find(
        ({ id }) => id === walletId
      );
      return {
        ...state.general,
        calculatedEarnings:
          state.general.calculatedEarnings[currentPlanIdInSelector],
        currency: state.settings[currentPlanIdInSelector].currency,
        monthInputs: currentWallet?.monthInputs,
        currentPlanId: currentPlanIdInSelector,
        currentWalletLabel: currentWallet?.label ?? "Wallet",
      };
    });
  const [dayScheduleState, setDayScheduleState] = useState<DayScheduleState>({
    isDayScheduleDialogOpen: false,
    dayScheduleForCurrentDay: [],
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

  const handleEditActionOnDayClick: (date: Moment) => React.MouseEventHandler =
    (date) => (evt) => {
      evt.preventDefault();
      const monthKey = date.format("01/MM/YYYY");
      const dayKey = date.format("DD/MM/YYYY");
      const day = date.date();
      const inputsForMonth = monthInputs?.[monthKey];
      const dayActions = inputsForMonth?.customGardenDayActions?.[dayKey];
      setDayScheduleState({
        isDayScheduleDialogOpen: true,
        dayScheduleForCurrentDay: dayActions ?? [],
        currentDayEarnings:
          walletEarnings?.yearEarnings[currentYear]?.monthEarnings[currentMonth]
            ?.dayEarnings[day],
        currentDate: date,
      });
    };

  const handleSaveGardenDayCustomSchedule = (
    updateWalletId: string,
    date?: Moment,
    daySchedule?: GardenDayAction[]
  ): void => {
    if (date && daySchedule) {
      const monthKey = date.format("01/MM/YYYY");
      const dayKey = date.format("DD/MM/YYYY");

      dispatch(
        updateWalletMonthInputs(
          updateWalletId,
          currentPlanId,
          monthInputsWithNewDaySchedule(
            monthKey,
            dayKey,
            daySchedule,
            monthInputs
          )
        )
      );
      setDayScheduleState({
        isDayScheduleDialogOpen: false,
        dayScheduleForCurrentDay: [],
      });
    }
  };

  useEffect(() => {
    setCurrentYear(earningYears[0]);
  }, [calculatedEarnings, earningYears]);

  useEffect(() => {
    if (currentYear !== prevCurrentYear) {
      const newMonthOptions = earningMonths.map((month): [number, string] => [
        month,
        monthLabels[month],
      ]);
      setMonthOptions(newMonthOptions);
      setCurrentMonth(newMonthOptions[0][0]);
    }
  }, [currentYear, prevCurrentYear, setCurrentMonth, earningMonths]);

  return (
    <div>
      <div className="garden-strategy-year-month-select-block">
        <HTMLSelect
          id="garden-strategy-year-select"
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
          id="garden-strategy-month-select"
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
                    content={resultsContent.gardenActionsColumnHelpText}
                    position={Position.BOTTOM}
                    openOnTargetFocus={false}
                  >
                    {resultsContent.gardenActionsColumnLabel}
                  </Tooltip2>
                </th>
                <th>
                  <Tooltip2
                    content={resultsContent.gardenSowOrHarvestColumnHelpText}
                    position={Position.BOTTOM}
                    openOnTargetFocus={false}
                  >
                    {resultsContent.gardenSowOrHarvestColumnLabel}
                  </Tooltip2>
                </th>
                <th>
                  <Tooltip2
                    content={
                      resultsContent.gardenPlantsBalanceEndOfDayColumnHelpText
                    }
                    position={Position.BOTTOM}
                    openOnTargetFocus={false}
                  >
                    {resultsContent.gardenPlantsBalanceEndOfDayColumnLabel}
                  </Tooltip2>
                </th>
                <th>
                  <Tooltip2
                    content={
                      resultsContent.gardenSeedsPerDayEndOfDayColumnHelpText
                    }
                    position={Position.BOTTOM}
                    openOnTargetFocus={false}
                  >
                    {resultsContent.gardenSeedsPerDayEndOfDayColumnLabel}
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
                  const renderDay = () => {
                    return <strong>{date.format("dddd Do")}</strong>;
                  };

                  const renderColumns = () => {
                    // Day earnings will reflect custom overrides if a user has provided
                    // specific day actions.
                    const actionsForDay = extractActionsForDay(dayEarnings);
                    const claimedInDripBUSDLP =
                      dayEarnings?.claimInDripBUSDLP ?? 0;
                    const reinvestInDripBUSDLP =
                      dayEarnings?.reinvestInDripBUSDLP ?? 0;
                    const plantsBalance = dayEarnings?.plantsBalance ?? 0;
                    const seedsPerDay = dayEarnings?.seedsPerDay ?? 0;

                    return (
                      <>
                        <td>{renderDay()}</td>
                        <td>
                          {actionsForDay}{" "}
                          <div className="top-small-margin">
                            <Tooltip2
                              content="Override actions for day"
                              position={Position.BOTTOM}
                              openOnTargetFocus={false}
                            >
                              <Button
                                icon="edit"
                                small
                                onClick={handleEditActionOnDayClick(date)}
                              />
                            </Tooltip2>
                          </div>
                        </td>
                        <td>
                          {(claimedInDripBUSDLP + reinvestInDripBUSDLP).toFixed(
                            4
                          )}
                        </td>
                        <td>
                          {Intl.NumberFormat("en-US", {
                            notation: "compact",
                            maximumFractionDigits: 1,
                          }).format(plantsBalance)}
                        </td>
                        <td>
                          {Intl.NumberFormat("en-US", {
                            notation: "compact",
                            maximumFractionDigits: 1,
                          }).format(seedsPerDay)}
                        </td>
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
      <GardenDaySchedule
        walletId={walletId}
        walletName={currentWalletLabel}
        daySchedule={dayScheduleState.dayScheduleForCurrentDay}
        calculatedDayEarnings={dayScheduleState.currentDayEarnings}
        date={dayScheduleState.currentDate}
        isOpen={dayScheduleState.isDayScheduleDialogOpen}
        onClose={() =>
          setDayScheduleState({
            isDayScheduleDialogOpen: false,
            dayScheduleForCurrentDay: [],
          })
        }
        onSaveClick={handleSaveGardenDayCustomSchedule}
      />
    </div>
  );
}

function extractActionsForDay(
  dayEarnings?: GardenDayEarnings
): React.ReactNode {
  if (!dayEarnings) {
    return "Unknown";
  }

  if (dayEarnings.isSowDay || dayEarnings.isHarvestDay) {
    return (
      <ul className="action-list">
        {dayEarnings.sowHarvestSchedule.map((dayAction) => {
          return (
            <li>
              <strong>
                <i>{actionLabels[dayAction.action]}</i>
              </strong>{" "}
              at {moment(new Date(dayAction.timestamp)).format("HH:mm:ss")}
            </li>
          );
        })}
      </ul>
    );
  }

  return "Leave Seeds to Accumulate";
}

function monthInputsWithNewDaySchedule(
  monthKey: string,
  dayKey: string,
  daySchedule: GardenDayAction[],
  monthInputs?: Record<string, MonthInput>
): Record<string, MonthInput> {
  const monthInput = monthInputs?.[monthKey];
  if (!monthInput) {
    return monthInputs ?? {};
  }

  return {
    ...monthInputs,
    [monthKey]: {
      ...monthInput,
      customGardenDayActions: {
        ...monthInput.customGardenDayActions,
        [dayKey]: daySchedule,
      },
    },
  };
}

const actionLabels = {
  sow: "Sow",
  harvest: "Harvest",
} as const;

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

export default GardenStrategyPanel;
