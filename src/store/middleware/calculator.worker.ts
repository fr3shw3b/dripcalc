import { expose } from "comlink";

import {
  DayEarnings,
  EarningsAndInfo,
  MonthEarningsAndInfo,
  NextActions,
  OverviewInfo,
  WalletEarnings,
  YearEarnings,
} from "./shared-calculator-types";
import createDripValueProvider from "../../services/drip-value-provider";
import type {
  HydrateFrequency,
  PlanSettings,
  SettingsState,
} from "../reducers/settings";
import type { WalletState } from "../reducers/plans";
import type { Config } from "../../contexts/config";
import moment from "moment";

export default {} as typeof Worker & { new (): Worker };

const api = {
  calculateEarnings: (data: string): string => {
    const { config, state }: { config: Config; state: AppState } =
      JSON.parse(data);
    const earningsAndInfo = calculateEarningsAndInfo(config, state);
    return JSON.stringify(earningsAndInfo);
  },
};

expose(api);

export interface CalculatorWorkerApi {
  calculateEarnings(data: string): Promise<string>;
}

// An augmented version of AppState that is adapted to be compatible
// with existing calculator functionality implemented before the introduction
// of plans when you could only have one "plan" with wallets and settings
// as top-level state.
export type AppState = {
  wallets: {
    wallets: WalletState[];
  };
  settings: PlanSettings;
};

function calculateEarningsAndInfo(
  config: Config,
  state: AppState
): EarningsAndInfo {
  const walletEarningsMapSeed: Record<string, WalletEarnings> = {};
  const walletEarningsMap = state.wallets.wallets.reduce(
    calculateWalletEarnings(config, state),
    walletEarningsMapSeed
  );
  return {
    walletEarnings: walletEarningsMap,
    info: computeOverviewInfo(walletEarningsMap, config, state),
  };
}

function computeOverviewInfo(
  walletEarningsMap: Record<string, WalletEarnings>,
  config: Config,
  state: AppState
): OverviewInfo {
  const seed: YearlyAccumulatedOverviewInfo = {
    totalClaimed: 0,
    totalClaimedInCurrency: 0,
    lastPayoutMonth: 0,
    netPositiveUpToDate: 0,
    totalEarnings: 0,
  };
  const accumYearlyOverviewInfo = Object.values(walletEarningsMap).reduce(
    (accum, walletEarnings) => {
      return Object.values(walletEarnings.yearEarnings).reduce(
        accumOverviewInfoFromYear,
        accum
      );
    },
    seed
  );
  const { depositsOutOfPocket, depositsOutOfPocketCoveredBy } =
    calculateDepositOverviewInfo(walletEarningsMap, state);
  return {
    totalClaimed: accumYearlyOverviewInfo.totalClaimed,
    totalClaimedInCurrency: accumYearlyOverviewInfo.totalClaimedInCurrency,
    lastPayoutMonth: accumYearlyOverviewInfo.lastPayoutMonth,
    netPositiveUpToDate: accumYearlyOverviewInfo.netPositiveUpToDate,
    percentageMaxPayoutConsumed:
      accumYearlyOverviewInfo.totalClaimed /
      accumYearlyOverviewInfo.totalEarnings,
    totalConsumedRewards: accumYearlyOverviewInfo.totalEarnings,
    // deposits out of pocket covers gas fees up to the point
    // daily claimed rewards can cover gas fees (dcr >= 2 . gf).
    // All deposits into the faucet are counted as deposits out
    // of pocket.
    depositsOutOfPocket,
    depositsOutOfPocketCoveredBy,
  };
}

function calculateDepositOverviewInfo(
  walletEarningsMap: Record<string, WalletEarnings>,
  state: AppState
): Pick<OverviewInfo, "depositsOutOfPocket" | "depositsOutOfPocketCoveredBy"> {
  const depositsOutOfPocket = Object.entries(walletEarningsMap).reduce(
    (accumDepositsOutOfPocket, [walletId, walletEarnings]) => {
      const wallet = state.wallets.wallets.find(({ id }) => id === walletId);
      const totalDeposits = Object.values(wallet?.monthInputs ?? {}).reduce(
        (accumTotalDeposits, monthInput) => {
          return (
            accumTotalDeposits +
            (monthInput.deposits ?? []).reduce(
              (accumMonthDeposits, deposit) => {
                return accumMonthDeposits + deposit.amountInCurrency;
              },
              0
            )
          );
        },
        0
      );
      const totalGasFeesOutOfPocket = Object.values(
        walletEarnings.yearEarnings
      ).reduce((totalGasFees, yearEarnings) => {
        return (
          totalGasFees +
          Object.values(yearEarnings.monthEarnings).reduce(
            (yearGasFees, monthEarnings) => {
              return (
                yearGasFees + monthEarnings.monthEstimatedGasFeesOutOfPocket
              );
            },
            0
          )
        );
      }, 0);
      return accumDepositsOutOfPocket + totalDeposits + totalGasFeesOutOfPocket;
    },
    0
  );
  return {
    depositsOutOfPocket,
    // Can be -1, if so display a string saying deposits out of pockets are never covered.
    // This only considers wallets in sequential fashion.
    // todo: support taking into account multiple wallets running in parallel.
    depositsOutOfPocketCoveredBy: getMonthClaimsCoverAmount(
      walletEarningsMap,
      depositsOutOfPocket
    ),
  };
}

// Returns timestamp of month in milliseconds.
function getMonthClaimsCoverAmount(
  walletEarningsMap: Record<string, WalletEarnings>,
  amountToCoverInCurrency: number
): number {
  return Object.values(walletEarningsMap).reduce(
    (coveredByMonth, walletEarnings) => {
      return Object.values(walletEarnings.yearEarnings).reduce(
        (coveredByMonthForYear, yearEarnings) => {
          return Object.values(yearEarnings.monthEarnings).reduce(
            (coveredByMonthForMonth, monthEarnings) => {
              if (
                coveredByMonthForMonth === -1 &&
                monthEarnings.accumClaimedInCurrency >= amountToCoverInCurrency
              ) {
                return monthEarnings.month;
              }
              return coveredByMonthForMonth;
            },
            coveredByMonthForYear
          );
        },
        coveredByMonth
      );
    },
    -1
  );
}

type YearlyAccumulatedOverviewInfo = Omit<
  OverviewInfo,
  | "percentageMaxPayoutConsumed"
  | "depositsOutOfPocket"
  | "depositsOutOfPocketCoveredBy"
  | "totalConsumedRewards"
> & { totalEarnings: number };

function accumOverviewInfoFromYear(
  accum: YearlyAccumulatedOverviewInfo,
  yearEarnings: YearEarnings
): YearlyAccumulatedOverviewInfo {
  const lastPayoutMonth = getLastPayoutMonthTimestamp(yearEarnings);
  return {
    // All values not overridden here will be calculated at the end of cycling
    // through years.
    totalClaimed: accum.totalClaimed + yearEarnings.totalYearClaimedAfterTax,
    totalClaimedInCurrency:
      accum.totalClaimedInCurrency + yearEarnings.totalYearClaimedInCurrency,
    // timestamp in milliseconds.
    lastPayoutMonth: yearEarnings.lastYear
      ? lastPayoutMonth
      : accum.lastPayoutMonth,
    netPositiveUpToDate: determineLastNetPositiveMonth(
      accum.netPositiveUpToDate,
      yearEarnings.monthEarnings
    ),
    totalEarnings: accum.totalEarnings + yearEarnings.totalYearEarnings,
  };
}

function determineLastNetPositiveMonth(
  prevSeedNetPositiveUpToDate: number,
  monthEarningsMap: Record<number, MonthEarningsAndInfo>
): number {
  const months = Object.keys(monthEarningsMap).map((str) =>
    Number.parseInt(str)
  );
  // Sort months so we iterate through them
  // in order of time.
  months.sort((a, b) => a - b);

  return months.reduce((prevNetPositiveUpToDate, monthKey) => {
    const monthEarnings = monthEarningsMap[monthKey];
    const rolled =
      monthEarnings.accumConsumedRewards - monthEarnings.accumClaimed;
    const depositBalance = monthEarnings.dripDepositBalanceEndOfMonth;

    const isNetPositive =
      depositBalance + rolled - monthEarnings.accumClaimed >= 0;

    return isNetPositive ? monthEarnings.month : prevNetPositiveUpToDate;
  }, prevSeedNetPositiveUpToDate);
}

function getLastPayoutMonthTimestamp(yearEarnings: YearEarnings): number {
  const months = Object.keys(yearEarnings.monthEarnings);
  months.sort();
  const lastMonth = Number.parseInt(months[months.length - 1]);
  const lastMonthEarnings = yearEarnings.monthEarnings[lastMonth];

  if (lastMonthEarnings.monthEarnings > 0) {
    return lastMonthEarnings.month;
  }

  let i = lastMonth - 1;
  let currentLastPayoutMonthTimestamp = lastMonthEarnings.month;
  let currentMonthEarnings = lastMonthEarnings.monthEarnings;
  while (currentMonthEarnings > 0 && i >= 0) {
    const currentMonth = yearEarnings.monthEarnings[i];
    currentMonthEarnings = currentMonth.monthEarnings;
    currentLastPayoutMonthTimestamp = currentMonth.month;
    i -= 1;
  }

  return currentLastPayoutMonthTimestamp;
}

type WalletEarningsCalculator = (
  accum: Record<string, WalletEarnings>,
  wallet: WalletState
) => Record<string, WalletEarnings>;

function calculateWalletEarnings(
  config: Config,
  state: AppState
): WalletEarningsCalculator {
  return (accum: Record<string, WalletEarnings>, wallet: WalletState) => {
    const yearEarningsMap: Record<number, YearEarnings> = {};
    const startDate = new Date(wallet.startDate);
    const firstYearEarnings = calculateYearEarnings(
      config,
      state,
      wallet,
      startDate
    );
    yearEarningsMap[startDate.getFullYear()] = firstYearEarnings;

    let totalYearEarnings = firstYearEarnings.totalYearEarnings;
    let prevDate = startDate;
    while (totalYearEarnings > 0) {
      const newDate = new Date(prevDate.getFullYear() + 1, 0, 1);

      const yearEarnings = calculateYearEarnings(
        config,
        state,
        wallet,
        newDate,
        yearEarningsMap
      );
      yearEarningsMap[newDate.getFullYear()] = yearEarnings;
      prevDate = newDate;
      totalYearEarnings = yearEarnings.totalYearEarnings;
      if (totalYearEarnings === 0) {
        // Now that we know there are no earnings this year,
        // the previous year is the last year.
        yearEarningsMap[prevDate.getFullYear()].lastYear = true;
      }
    }

    return {
      ...accum,
      [wallet.id]: {
        yearEarnings: yearEarningsMap,
      },
    };
  };
}

type YearEarningsSummary = {
  totalYearClaimedAfterTax: number;
  totalYearClaimedInCurrency: number;
  totalYearEarnings: number;
  totalYearEarningsInCurrency: number;
};

function calculateYearEarnings(
  config: Config,
  state: AppState,
  wallet: WalletState,
  startDate: Date,
  accumYearEarnings?: Record<number, YearEarnings>
): YearEarnings {
  const monthOffset = startDate.getMonth();
  // For example, 12 - 11 gives 1 month in year if the start date is December.
  const monthsInYear = 12 - startDate.getMonth();
  const monthEarningsSeed: Record<number, MonthEarningsAndInfo> = {};
  const monthEarningDates = [...Array(monthsInYear)].map((_, i) => {
    if (i === 0) {
      return startDate;
    }
    return new Date(startDate.getFullYear(), monthOffset + i, 1);
  });
  const lastMonthOfPrevYearEarnings =
    accumYearEarnings?.[startDate.getFullYear() - 1]?.monthEarnings[11];
  const monthEarningsMap = monthEarningDates.reduce(
    calculateMonthEarnings(config, state, wallet, lastMonthOfPrevYearEarnings),
    monthEarningsSeed
  );

  const seed: YearEarningsSummary = {
    totalYearEarnings: 0,
    totalYearClaimedAfterTax: 0,
    totalYearClaimedInCurrency: 0,
    totalYearEarningsInCurrency: 0,
  };
  const {
    totalYearClaimedAfterTax,
    totalYearClaimedInCurrency,
    totalYearEarnings,
    totalYearEarningsInCurrency,
  } = Object.values(monthEarningsMap).reduce((accum, monthEarnings) => {
    return {
      totalYearClaimedAfterTax:
        accum.totalYearClaimedAfterTax + monthEarnings.monthClaimedAfterTax,
      totalYearClaimedInCurrency:
        accum.totalYearClaimedInCurrency + monthEarnings.monthClaimedInCurrency,
      totalYearEarnings: accum.totalYearEarnings + monthEarnings.monthEarnings,
      totalYearEarningsInCurrency:
        accum.totalYearEarningsInCurrency +
        monthEarnings.monthEarningsInCurrency,
    };
  }, seed);

  return {
    year: startDate.getFullYear(),
    monthEarnings: monthEarningsMap,
    totalYearClaimedAfterTax,
    totalYearClaimedInCurrency,
    totalYearEarnings,
    totalYearEarningsInCurrency,
    // Last year is set to true when we have the context.
    lastYear: false,
  };
}

type MonthEarningsCalculator = (
  accum: Record<string, MonthEarningsAndInfo>,
  date: Date
) => Record<number, MonthEarningsAndInfo>;

const dripValueProvider = createDripValueProvider();

function calculateMonthEarnings(
  config: Config,
  state: AppState,
  wallet: WalletState,
  lastMonthOfPrevYearEarnings?: MonthEarningsAndInfo
): MonthEarningsCalculator {
  return (accum: Record<number, MonthEarningsAndInfo>, date: Date) => {
    const month = date.getMonth();
    // Format of custom month input keys is dd/mm/yyyy.
    const monthInputsKey = moment(date).format("01/MM/YYYY");
    const totalDaysInMonth = getDaysInMonth(date);
    const earningDaysInMonth = totalDaysInMonth - date.getDate() + 1;
    const offsetDay = date.getDate();
    const dayEarningDates = [...Array(earningDaysInMonth)].map((_, i) => {
      if (i === 0) {
        return date;
      }
      return new Date(date.getFullYear(), date.getMonth(), offsetDay + i);
    });

    const earliestWalletStartTimestamp = state.wallets.wallets.reduce(
      (prevEarliestStartDate, currentWallet) => {
        return currentWallet.startDate < prevEarliestStartDate
          ? currentWallet.startDate
          : prevEarliestStartDate;
      },
      /* 15/01/2100 as seed date in milliseconds */ 4103698536000
    );
    const lastDripValueInCurrentWalletTimestamp = Object.entries(
      wallet.monthInputs
    ).reduce((prevTimestamp, [monthInputKey, { dripValue }]) => {
      if (dripValue && dripValue > 0) {
        const timestamp = Number.parseInt(
          moment(monthInputKey, "DD/MM/YYYY").format("x")
        );
        return timestamp > prevTimestamp ? timestamp : prevTimestamp;
      }
      return prevTimestamp;
    }, /* earliest wallet start date is the seed date to fall back on */ earliestWalletStartTimestamp);
    const trendTargetDripValue = determineTrendTargetDripValue(state.settings);
    const dripValueForMonth =
      wallet.monthInputs[monthInputsKey]?.dripValue ??
      dripValueProvider.getDripValueForMonth(
        new Date(earliestWalletStartTimestamp),
        date,
        getLastCustomDripValue(wallet, config.defaultDripValue),
        trendTargetDripValue,
        state.settings.dripValueTrend,
        state.settings.trendPeriod,
        new Date(lastDripValueInCurrentWalletTimestamp)
      );

    const lastMonthEarnings = accum[month - 1] ?? lastMonthOfPrevYearEarnings;
    const lastDayOfPrevMonthEarnings =
      accum[month - 1]?.dayEarnings[
        getDaysInMonth(new Date(accum[month - 1].month))
      ] ??
      lastMonthOfPrevYearEarnings?.dayEarnings?.[
        getDaysInMonth(new Date(lastMonthOfPrevYearEarnings.month))
      ];
    const dayEarningsSeed: Record<number, DayEarnings> = {};
    const dayEarnings = dayEarningDates.reduce(
      calculateDayEarnings(
        config,
        state,
        wallet,
        dripValueForMonth,
        lastDayOfPrevMonthEarnings
      ),
      dayEarningsSeed
    );

    const {
      monthEarnings,
      monthEarningsInCurrency,
      monthReinvestedAfterTax,
      monthReinvestedInCurrency,
      monthClaimedAfterTax,
      monthClaimedInCurrency,
      monthEstimatedGasFees,
      monthEstimatedGasFeesOutOfPocket,
    } = sumDayAmountsForMonth(dayEarnings);

    const accumConsumedRewards =
      dayEarnings[totalDaysInMonth].accumConsumedRewards;
    const dripDepositBalanceEndOfMonth =
      dayEarnings[totalDaysInMonth].dripDepositBalance;
    const maxPayout = Math.min(
      dripDepositBalanceEndOfMonth * config.depositMultiplier,
      config.maxPayoutCap
    );

    return {
      ...accum,
      [month]: {
        month: date.getTime(),
        monthEarnings,
        monthEarningsInCurrency,
        monthReinvestedAfterTax,
        monthReinvestedInCurrency,
        monthClaimedAfterTax,
        monthClaimedInCurrency,
        dayEarnings,
        dripDepositBalanceEndOfMonth,
        accumClaimed:
          (lastMonthEarnings?.accumClaimed ?? 0) + monthClaimedAfterTax,
        accumClaimedInCurrency:
          (lastMonthEarnings?.accumClaimedInCurrency ?? 0) +
          monthClaimedInCurrency,
        accumConsumedRewards,
        monthEstimatedGasFees,
        monthEstimatedGasFeesOutOfPocket,
        // Half of deposit balance or consumed rewards reaches current max payout/max payout cap
        // indicates time for a new wallet.
        nextActions: determineNextActions(
          dripDepositBalanceEndOfMonth,
          config,
          accumConsumedRewards,
          maxPayout,
          lastMonthEarnings?.nextActions
        ),
        dripValueForMonth,
      },
    };
  };
}

function determineNextActions(
  dripDepositBalanceEndOfMonth: number,
  config: Config,
  accumConsumedRewards: number,
  maxPayout: number,
  lastMonthNextActions?: NextActions
): NextActions {
  if (accumConsumedRewards === 0 || maxPayout === 0) {
    return "keepCompounding";
  }

  // Disabled new wallet required behaviour as creates confusion with new claiming strategy
  // that allows rewards to accumulate to save on gas fees!
  // When we are within 10% of the max payout, let's make it more pressing
  // to indicate a new wallet is required.
  // if (
  //   lastMonthNextActions === "newWalletRequired" ||
  //   accumConsumedRewards >= maxPayout - maxPayout * 0.1
  // ) {
  //   return "newWalletRequired";
  // }

  return lastMonthNextActions === "considerNewWallet" ||
    dripDepositBalanceEndOfMonth >= config.maxDepositBalance / 2 ||
    accumConsumedRewards >= maxPayout
    ? "considerNewWallet"
    : "keepCompounding";
}

function determineTrendTargetDripValue(settings: PlanSettings): number {
  if (settings.dripValueTrend === "uptrend") {
    return settings.uptrendMaxValue;
  }

  if (settings.dripValueTrend === "downtrend") {
    return settings.downtrendMinValue;
  }

  return settings.stabilisesAt;
}

function getLastCustomDripValue(
  wallet: WalletState,
  fallbackDripValue: number
): number {
  const monthDates = Object.keys(wallet.monthInputs);
  monthDates.sort((monthAStr, monthBStr) => {
    // eslint-disable-next-line
    const [_dayA, monthA, yearA] = monthAStr
      .split("/")
      .map((val) => Number.parseInt(val));
    // eslint-disable-next-line
    const [_dayB, monthB, yearB] = monthBStr
      .split("/")
      .map((val) => Number.parseInt(val));
    if (yearA < yearB || (yearA === yearB && monthA < monthB)) {
      return -1;
    }
    return 1;
  });
  return monthDates.length > 0
    ? wallet.monthInputs[monthDates[monthDates.length - 1]].dripValue ??
        fallbackDripValue
    : fallbackDripValue;
}

type SummedMonthAmounts = Pick<
  MonthEarningsAndInfo,
  | "monthEarnings"
  | "monthEarningsInCurrency"
  | "monthReinvestedAfterTax"
  | "monthReinvestedInCurrency"
  | "monthClaimedAfterTax"
  | "monthClaimedInCurrency"
  | "monthEstimatedGasFees"
  | "monthEstimatedGasFeesOutOfPocket"
>;

function sumDayAmountsForMonth(
  dayEarnings: Record<number, DayEarnings>
): SummedMonthAmounts {
  const seed: SummedMonthAmounts = {
    monthEarnings: 0,
    monthEarningsInCurrency: 0,
    monthReinvestedAfterTax: 0,
    monthReinvestedInCurrency: 0,
    monthClaimedAfterTax: 0,
    monthClaimedInCurrency: 0,
    monthEstimatedGasFees: 0,
    monthEstimatedGasFeesOutOfPocket: 0,
  };
  return Object.values(dayEarnings).reduce((accum, earningsForDay) => {
    const dayGasFeesOutOfPocket =
      earningsForDay.estimatedGasFeesCoveredByClaimedRewards
        ? earningsForDay.estimatedGasFees
        : 0;
    return {
      monthEarnings: accum.monthEarnings + earningsForDay.earnings,
      monthEarningsInCurrency:
        accum.monthEarningsInCurrency + earningsForDay.earningsInCurrency,
      monthReinvestedAfterTax:
        accum.monthReinvestedAfterTax + earningsForDay.reinvestAfterTax,
      monthReinvestedInCurrency:
        accum.monthReinvestedInCurrency + earningsForDay.reinvestInCurrency,
      monthClaimedAfterTax:
        accum.monthClaimedAfterTax + earningsForDay.claimAfterTax,
      monthClaimedInCurrency:
        accum.monthClaimedInCurrency + earningsForDay.claimInCurrency,
      monthEstimatedGasFees:
        accum.monthEstimatedGasFees + earningsForDay.estimatedGasFees,
      monthEstimatedGasFeesOutOfPocket:
        accum.monthEstimatedGasFeesOutOfPocket + dayGasFeesOutOfPocket,
    };
  }, seed);
}

type DayEarningsCalculator = (
  accum: Record<string, DayEarnings>,
  date: Date
) => Record<number, DayEarnings>;

const emptyDayEarnings: DayEarnings = {
  earnings: 0,
  earningsInCurrency: 0,
  reinvestAfterTax: 0,
  reinvestInCurrency: 0,
  claimAfterTax: 0,
  claimInCurrency: 0,
  dripDepositBalance: 0,
  estimatedGasFees: 0,
  accumConsumedRewards: 0,
  accumDailyRewards: 0,
  dripValueOnDay: 0,
  estimatedGasFeesCoveredByClaimedRewards: false,
  isHydrateDay: false,
  isClaimDay: false,
  leaveRewardsToAccumulateForClaim: false,
  leaveRewardsToAccumulateForHydrate: false,
  lastHydrateTimestamp: 0,
};

function calculateDayEarnings(
  config: Config,
  state: AppState,
  wallet: WalletState,
  dripValueForMonth: number,
  lastDayOfPrevMonthEarnings?: DayEarnings
): DayEarningsCalculator {
  return (accum: Record<number, DayEarnings>, date: Date) => {
    const dayInMonth = date.getDate();
    const prevDayEarningsData =
      accum[dayInMonth - 1] ?? lastDayOfPrevMonthEarnings ?? emptyDayEarnings;
    // Format of custom month input keys is dd/mm/yyyy.
    const monthInputsKey = moment(date).format("01/MM/YYYY");

    const maxPayout = Math.min(
      prevDayEarningsData.dripDepositBalance * config.depositMultiplier,
      config.maxPayoutCap
    );

    const candidateRewardsForDay =
      prevDayEarningsData.dripDepositBalance * config.dailyCompound;

    const initialAccumDayEarnings = determineAccumDayEarnings(
      prevDayEarningsData.accumDailyRewards + candidateRewardsForDay,
      maxPayout,
      prevDayEarningsData.accumConsumedRewards
    );

    const { isClaimDay, accumulateAvailableRewardsToClaim } = shouldClaimOnDay(
      date,
      state.settings.claimDays,
      wallet.monthInputs[monthInputsKey]?.reinvest ?? config.defaultReinvest,
      maxPayout,
      prevDayEarningsData.accumConsumedRewards + initialAccumDayEarnings
    );

    const dripValueForDay = dripValueProvider.applyVariance(dripValueForMonth);

    const { isHydrateDay, accumulateAvailableRewardsToHydrate } =
      shouldHydrateOnDay(
        new Date(prevDayEarningsData.lastHydrateTimestamp),
        determineHydrateFrequency(
          wallet.monthInputs[monthInputsKey]?.hydrateStrategy,
          state.settings.defaultHydrateFrequency
        ),
        date,
        wallet.monthInputs[monthInputsKey]?.reinvest ?? config.defaultReinvest,
        maxPayout,
        initialAccumDayEarnings,
        prevDayEarningsData.accumConsumedRewards + initialAccumDayEarnings,
        state.settings.claimDays,
        state.settings,
        dripValueForDay
      );

    const leaveRewardsAvailableToAccumulate =
      accumulateAvailableRewardsToClaim || accumulateAvailableRewardsToHydrate;

    // For the purposes of showing how much has been earned in rewards for the day, summing
    // for each day to show total for month or year and accumulating available
    // rewards that have not yet been claimed or hydrated.
    const dayEarnings =
      prevDayEarningsData.accumConsumedRewards >= maxPayout
        ? 0
        : candidateRewardsForDay;

    const accumDayEarningsAfterWhaleTax =
      initialAccumDayEarnings -
      initialAccumDayEarnings *
        whaleTax(
          config,
          prevDayEarningsData.accumConsumedRewards + initialAccumDayEarnings
        );

    const accumDayEarnings =
      prevDayEarningsData.accumConsumedRewards + initialAccumDayEarnings <=
      maxPayout
        ? accumDayEarningsAfterWhaleTax
        : maxPayout - prevDayEarningsData.accumConsumedRewards;

    const reinvestAfterTax =
      !isClaimDay && !leaveRewardsAvailableToAccumulate
        ? accumDayEarnings - accumDayEarnings * config.hydrateTax
        : 0;

    const newDepositBalance =
      prevDayEarningsData.dripDepositBalance + reinvestAfterTax;

    const claimAfterTax = isClaimDay
      ? accumDayEarnings - accumDayEarnings * config.claimTax
      : 0;

    // Add deposited amount on this day after calculating claims as it will impact
    // the next day's 1% rewards.
    const deposits = wallet.monthInputs[monthInputsKey]?.deposits ?? [];
    const depositOnCurrentDay = deposits.find(
      (deposit) => deposit.dayOfMonth === dayInMonth
    );
    const depositAfterFees = depositOnCurrentDay
      ? depositOnCurrentDay.amountInCurrency -
        depositOnCurrentDay.amountInCurrency * config.cexFeePercentage -
        config.depositBufferFees
      : 0;

    const depositInDripBeforeTax =
      depositAfterFees > 0 ? depositAfterFees / dripValueForDay : 0;

    const depositInDrip =
      depositInDripBeforeTax - depositInDripBeforeTax * config.depositTax;
    const finalDepositBalanceEndOfDay = newDepositBalance + depositInDrip;

    const claimOrHydrateGasFee =
      !leaveRewardsAvailableToAccumulate &&
      (reinvestAfterTax > 0 || claimAfterTax > 0)
        ? state.settings.averageGasFee
        : 0;
    const estimatedGasFees =
      depositInDrip > 0
        ? claimOrHydrateGasFee + state.settings.averageGasFee
        : claimOrHydrateGasFee;

    return {
      ...accum,
      [dayInMonth]: {
        earnings: dayEarnings,
        earningsInCurrency: dayEarnings * dripValueForDay,
        reinvestAfterTax,
        reinvestInCurrency: reinvestAfterTax * dripValueForDay,
        claimAfterTax,
        claimInCurrency: claimAfterTax * dripValueForDay,
        dripDepositBalance: finalDepositBalanceEndOfDay,
        estimatedGasFees,
        accumConsumedRewards:
          // Consumed rewards are the accumulation of available rewards before deciding to hydrate
          // or claim and before any taxes are applied.
          prevDayEarningsData.accumConsumedRewards + initialAccumDayEarnings,
        accumDailyRewards: leaveRewardsAvailableToAccumulate
          ? // Capture day earnings to be accumulated in the "Available" column
            // before any tax is applied!
            prevDayEarningsData.accumDailyRewards + dayEarnings
          : // Reset to 0 if rewards have been claimed to wallet or reinvested!
            0,
        dripValueOnDay: dripValueForDay,
        estimatedGasFeesCoveredByClaimedRewards:
          claimAfterTax > 2 * estimatedGasFees,
        isClaimDay,
        leaveRewardsToAccumulateForClaim: accumulateAvailableRewardsToClaim,
        leaveRewardsToAccumulateForHydrate: accumulateAvailableRewardsToHydrate,
        isHydrateDay: isHydrateDay,
        lastHydrateTimestamp: isHydrateDay
          ? Number.parseInt(moment(date).format("x"))
          : prevDayEarningsData.lastHydrateTimestamp,
      },
    };
  };
}

function determineHydrateFrequency(
  hydrateStrategy: "default" | HydrateFrequency | undefined,
  defaultHydrateFrequency: HydrateFrequency
): HydrateFrequency {
  if (!hydrateStrategy || hydrateStrategy === "default") {
    return defaultHydrateFrequency;
  }
  return hydrateStrategy;
}

function determineAccumDayEarnings(
  candidateAccumAvailableRewards: number,
  maxPayout: number,
  prevAccumRewards: number
): number {
  const totalAccum = prevAccumRewards + candidateAccumAvailableRewards;
  if (totalAccum <= maxPayout) {
    return candidateAccumAvailableRewards;
  }

  const amountOverMaxPayout = totalAccum - maxPayout;
  return candidateAccumAvailableRewards > amountOverMaxPayout
    ? candidateAccumAvailableRewards - amountOverMaxPayout
    : 0;
}

function whaleTax(config: Config, depositBalance: number): number {
  const fractionOfSupply = depositBalance / config.totalDripSupply;
  const normalised = fractionOfSupply > 0.1 ? 0.1 : fractionOfSupply;
  const threshold = normalised.toFixed(2);
  return config.claimWhaleTaxThresholds[threshold];
}

function shouldClaimOnDay(
  date: Date,
  claimDays: string,
  reinvest: number,
  maxPayout: number,
  totalConsumedIncludingAccumulatedAvailableRewards: number
): { isClaimDay: boolean; accumulateAvailableRewardsToClaim: boolean } {
  const daysInMonth = getDaysInMonth(date);
  // When days in month are not even, we'll take the extra day for claims!
  const numberOfClaimDays = Math.ceil(daysInMonth * (1 - reinvest));
  if (numberOfClaimDays === 0) {
    return { isClaimDay: false, accumulateAvailableRewardsToClaim: false };
  }

  // Claim regardless if today is the last day of the claim period
  // as we don't want any accumulated available rewards feeding into hydrates.
  const isLastDayOfClaimsPeriodForMonth =
    (claimDays === "startOfMonth" && date.getDate() === numberOfClaimDays) ||
    (claimDays === "endOfMonth" && date.getDate() === daysInMonth);

  if (isLastDayOfClaimsPeriodForMonth) {
    return {
      isClaimDay: true,
      accumulateAvailableRewardsToClaim: false,
    };
  }

  // Make sure it's a claim day if we will be within 10% of max payout
  // by claiming today's (and accumulated available) rewards.
  const closeToMaxPayout =
    totalConsumedIncludingAccumulatedAvailableRewards >=
    maxPayout - maxPayout * 0.1;

  if (claimDays === "startOfMonth") {
    // Only claim on ${numberOfClaimDays}.
    // e.g. 30 days in a month, 70% reinvest leaves 30% for claiming
    // which is 9 days, so claim on the 9th.
    return {
      isClaimDay:
        (closeToMaxPayout && date.getDate() < numberOfClaimDays) ||
        date.getDate() === numberOfClaimDays,
      accumulateAvailableRewardsToClaim:
        !closeToMaxPayout && date.getDate() < numberOfClaimDays,
    };
  }
  // Only claim on last day of the month.
  return {
    isClaimDay:
      date.getDate() === daysInMonth ||
      (date.getDate() >= daysInMonth - numberOfClaimDays && closeToMaxPayout),
    accumulateAvailableRewardsToClaim:
      date.getDate() < daysInMonth &&
      date.getDate() >= daysInMonth - numberOfClaimDays &&
      !closeToMaxPayout,
  };
}

function shouldHydrateOnDay(
  lastHydrateDate: Date,
  hydrateFrequency: HydrateFrequency,
  date: Date,
  reinvest: number,
  maxPayout: number,
  accumulatedAvailableRewards: number,
  totalConsumedIncludingAccumulatedAvailableRewards: number,
  claimDays: string,
  settings: PlanSettings,
  dripPriceforDay: number
): { isHydrateDay: boolean; accumulateAvailableRewardsToHydrate: boolean } {
  const lastHydrateTimestamp = Number.parseInt(
    moment(lastHydrateDate).format("x")
  );
  // If some available rewards have accumulated and you haven't yet hydrated
  // then let's begin!
  if (lastHydrateTimestamp === 0 && accumulatedAvailableRewards > 0) {
    return {
      isHydrateDay: true,
      accumulateAvailableRewardsToHydrate: false,
    };
  }

  const daysInMonth = getDaysInMonth(date);

  // When days in month are not even, we'll take the extra day for claims!
  const numberofHydrateDays = Math.floor(daysInMonth * reinvest);
  const numberOfClaimDays = daysInMonth - numberofHydrateDays;
  if (numberofHydrateDays === 0) {
    return { isHydrateDay: false, accumulateAvailableRewardsToHydrate: false };
  }
  // Make sure it's a hydrate day if we will be within 10% of max payout
  // by claiming today's (and accumulated available) rewards.
  const closeToMaxPayout =
    totalConsumedIncludingAccumulatedAvailableRewards >=
    maxPayout - maxPayout * 0.1;

  // Exclude the claim days at the start of the month.
  if (claimDays === "startOfMonth" && date.getDate() <= numberOfClaimDays) {
    return {
      isHydrateDay: false,
      accumulateAvailableRewardsToHydrate: false,
    };
  }

  // Exclude the claim days at the end of the month.
  if (
    claimDays === "endOfMonth" &&
    date.getDate() >= daysInMonth - numberOfClaimDays
  ) {
    return {
      isHydrateDay: false,
      accumulateAvailableRewardsToHydrate: false,
    };
  }

  // We are definitely in hydrate territory now so if we are nearing max payout
  // then we have no choice but to hydrate!
  if (closeToMaxPayout) {
    return {
      isHydrateDay: true,
      accumulateAvailableRewardsToHydrate: false,
    };
  }

  if (hydrateFrequency === "everyDay") {
    return {
      isHydrateDay: true,
      accumulateAvailableRewardsToHydrate: false,
    };
  }

  // Hydrate regardless if today is the last day of the hydrate period
  // as we don't want any accumulated available rewards feeding into claims.
  const isLastDayOfHydratePeriodForMonth =
    (claimDays === "startOfMonth" && date.getDate() === daysInMonth) ||
    (claimDays === "endOfMonth" && date.getDate() === numberofHydrateDays);

  if (isLastDayOfHydratePeriodForMonth) {
    return {
      isHydrateDay: true,
      accumulateAvailableRewardsToHydrate: false,
    };
  }

  if (hydrateFrequency === "automatic") {
    // Automatic mode tries to hydrate daily as long as gas fees are < 25% of
    // accumulated available rewards.
    const accumulatedAvailableRewardsInCurrency =
      accumulatedAvailableRewards * dripPriceforDay;
    // Estimated gas fee is in fiat currency so we need to compare with the current fiat amount
    // of accumulated rewards!
    const isGasFeeLessThan25Percent =
      settings.averageGasFee < accumulatedAvailableRewardsInCurrency * 0.25;
    return {
      isHydrateDay: isGasFeeLessThan25Percent,
      accumulateAvailableRewardsToHydrate: !isGasFeeLessThan25Percent,
    };
  }

  // At this point if we haven't yet hydrated then we will accumulate available rewards
  // as we know we haven't hydrated from the timestamp and that we haven't accumulated any rewards yet
  // from the first check in this fucntion.
  if (lastHydrateTimestamp === 0) {
    return {
      isHydrateDay: false,
      accumulateAvailableRewardsToHydrate: true,
    };
  }

  // Make sure we are ignoring the time in the comparison.
  const lastHydrateDateMoment = moment(lastHydrateDate).startOf("day");
  const currentDateMoment = moment(date).startOf("day");
  const daysBetween = moment
    .duration(lastHydrateDateMoment.diff(currentDateMoment))
    .asDays();

  const hydrateFrequencyInDays = HYDRATE_FREQUENCY_DAYS[hydrateFrequency];

  const shouldWeHydrateToday = daysBetween % hydrateFrequencyInDays === 0;

  return {
    isHydrateDay: shouldWeHydrateToday,
    accumulateAvailableRewardsToHydrate: !shouldWeHydrateToday,
  };
}

const HYDRATE_FREQUENCY_DAYS: Record<"everyOtherDay" | "everyWeek", number> = {
  everyOtherDay: 2,
  everyWeek: 7,
};

function getDaysInMonth(date: Date): number {
  const month = date.getMonth();
  const year = date.getFullYear();
  return [
    31,
    isLeapYear(year) ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ][month];
}

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}
