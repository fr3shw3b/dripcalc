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
import type { SettingsState } from "../reducers/settings";
import type { WalletState } from "../reducers/wallets";
import type { AppState } from "../types";
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
  prevNetPositiveUpToDate: number,
  monthEarningsMap: Record<number, MonthEarningsAndInfo>
): number {
  const months = Object.keys(monthEarningsMap).map((str) =>
    Number.parseInt(str)
  );
  // Sort months so we iterate through them
  // in order of time.
  months.sort();

  return months.reduce((prevNetPositiveUpToDate, monthKey) => {
    const monthEarnings = monthEarningsMap[monthKey];
    const rolled =
      monthEarnings.accumConsumedRewards - monthEarnings.accumClaimed;
    const depositBalance = monthEarnings.dripDepositBalanceEndOfMonth;

    const isNetPositive =
      depositBalance + rolled - monthEarnings.accumClaimed >= 0;

    return isNetPositive ? monthEarnings.month : prevNetPositiveUpToDate;
  }, prevNetPositiveUpToDate);
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
      (prevEarliestStartDate, wallet) => {
        return wallet.startDate < prevEarliestStartDate
          ? wallet.startDate
          : prevEarliestStartDate;
      },
      /* 15/01/2100 as seed date in milliseconds */ 4103698536000
    );
    const trendTargetDripValue = determineTrendTargetDripValue(state.settings);
    const dripValueForMonth =
      wallet.monthInputs[monthInputsKey]?.dripValue ??
      dripValueProvider.getDripValueForMonth(
        new Date(earliestWalletStartTimestamp),
        date,
        getLastCustomDripValue(wallet, config.defaultDripValue),
        trendTargetDripValue,
        state.settings.dripValueTrend
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
          lastMonthEarnings.nextActions
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

  // When we are within 10% of the max payout, let's make it more pressing
  // to indicate a new wallet is required.
  if (
    lastMonthNextActions === "newWalletRequired" ||
    accumConsumedRewards >= maxPayout - maxPayout * 0.1
  ) {
    return "newWalletRequired";
  }

  return lastMonthNextActions === "considerNewWallet" ||
    dripDepositBalanceEndOfMonth >= config.maxDepositBalance / 2 ||
    accumConsumedRewards >= maxPayout
    ? "considerNewWallet"
    : "keepCompounding";
}

function determineTrendTargetDripValue(settings: SettingsState): number {
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
  dripValueOnDay: 0,
  estimatedGasFeesCoveredByClaimedRewards: false,
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

    const isClaimDay = shouldClaimOnDay(
      date,
      state.settings.claimDays,
      wallet.monthInputs[monthInputsKey]?.reinvest ?? config.defaultReinvest
    );

    const dayEarnings =
      prevDayEarningsData.accumConsumedRewards >= config.maxPayoutCap
        ? 0
        : prevDayEarningsData.dripDepositBalance * config.dailyCompound;

    const reinvestAfterTax = !isClaimDay
      ? dayEarnings - dayEarnings * config.hydrateTax
      : 0;

    const newDepositBalance =
      prevDayEarningsData.dripDepositBalance + reinvestAfterTax;

    const claimBeforeWhaleTax = isClaimDay
      ? dayEarnings - dayEarnings * config.claimTax
      : 0;

    const claimAfterTax =
      claimBeforeWhaleTax -
      claimBeforeWhaleTax * whaleTax(config, newDepositBalance);

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

    const dripValueForDay = dripValueProvider.applyVariance(dripValueForMonth);
    const depositInDripBeforeTax =
      depositAfterFees > 0 ? depositAfterFees / dripValueForDay : 0;

    const depositInDrip =
      depositInDripBeforeTax - depositInDripBeforeTax * config.depositTax;
    const finalDepositBalanceEndOfDay = newDepositBalance + depositInDrip;

    const estimatedGasFees =
      depositInDrip > 0
        ? state.settings.averageGasFee * 2
        : state.settings.averageGasFee;

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
        // Multiply gas fee by 2 for deposit and compound/claim.
        estimatedGasFees,
        accumConsumedRewards:
          prevDayEarningsData.accumConsumedRewards + dayEarnings,
        dripValueOnDay: dripValueForDay,
        estimatedGasFeesCoveredByClaimedRewards:
          claimAfterTax > 2 * estimatedGasFees,
      },
    };
  };
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
  reinvest: number
): boolean {
  const daysInMonth = getDaysInMonth(date);
  const numberOfClaimDays = Math.round(daysInMonth * (1 - reinvest));
  if (claimDays === "startOfMonth") {
    return date.getDate() <= numberOfClaimDays;
  }
  return date.getDate() > daysInMonth - numberOfClaimDays;
}

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
