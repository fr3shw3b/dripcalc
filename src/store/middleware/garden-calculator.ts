import type { Config } from "../../contexts/config";
import {
  GardenDayActionValue,
  GardenDayAction,
  WalletState,
  Deposit,
} from "../reducers/plans";
import {
  AppState,
  GardenDayEarnings,
  GardenEarnings,
  GardenMonthEarningsAndInfo,
  GardenOverviewInfo,
  GardenYearEarnings,
  WalletGardenEarnings,
} from "./shared-calculator-types";
import createTokenValueProvider from "../../services/token-value-provider";
import moment from "moment";
import { PlanSettings, SowFrequency } from "../reducers/settings";
import { getDaysInMonth } from "../../utils/date";

export function calculateGardenEarnings(
  config: Config,
  state: AppState
): { gardenEarnings: GardenEarnings } {
  const gardenWalletEarningsMapSeed: Record<string, WalletGardenEarnings> = {};
  const gardenWalletEarningsMap = state.wallets.wallets.reduce(
    calculateGardenWalletEarnings(config, state),
    gardenWalletEarningsMapSeed
  );
  return {
    gardenEarnings: {
      walletEarnings: gardenWalletEarningsMap,
      info: computeGardenOverviewInfo(gardenWalletEarningsMap),
    },
  };
}

function computeGardenOverviewInfo(
  walletEarningsMap: Record<string, WalletGardenEarnings>
): GardenOverviewInfo {
  const seed: GardenOverviewInfo = {
    totalHarvestedRewardsInCurrency: 0,
    totalHarvestedRewardsInDripBUSDLP: 0,
    totalPlantsBalanceByEnd: 0,
  };
  return Object.values(walletEarningsMap).reduce((accum, walletEarnings) => {
    const yearsEarning = Object.keys(walletEarnings.yearEarnings).map((year) =>
      Number.parseInt(year)
    );
    yearsEarning.sort((a, b) => a - b);

    return Object.entries(walletEarnings.yearEarnings)
      .map(([year, earnings]) => ({ ...earnings, year: Number.parseInt(year) }))
      .reduce(accumGardenOverviewInfoFromYear(yearsEarning), accum);
  }, seed);
}

function accumGardenOverviewInfoFromYear(yearsEarningOrdered: number[]) {
  return (
    accum: GardenOverviewInfo,
    yearEarnings: GardenYearEarnings & { year: number }
  ): GardenOverviewInfo => {
    const lastYearInWallet =
      yearsEarningOrdered[yearsEarningOrdered.length - 1];
    return {
      totalHarvestedRewardsInDripBUSDLP:
        accum.totalHarvestedRewardsInDripBUSDLP +
        yearEarnings.totalYearHarvestedInDripBUSDLP,
      totalHarvestedRewardsInCurrency:
        accum.totalHarvestedRewardsInCurrency +
        yearEarnings.totalYearHarvestedInCurrency,
      totalPlantsBalanceByEnd:
        yearEarnings.year === lastYearInWallet
          ? accum.totalPlantsBalanceByEnd + yearEarnings.plantBalanceEndOfYear
          : accum.totalPlantsBalanceByEnd,
    };
  };
}

type GardenWalletEarningsCalculator = (
  accum: Record<string, WalletGardenEarnings>,
  wallet: WalletState
) => Record<string, WalletGardenEarnings>;

function calculateGardenWalletEarnings(
  config: Config,
  state: AppState
): GardenWalletEarningsCalculator {
  return (accum: Record<string, WalletGardenEarnings>, wallet: WalletState) => {
    const yearEarningsMap: Record<number, GardenYearEarnings> = {};
    const startDate = new Date(wallet.startDate);
    let currentDate = startDate;
    while (currentDate.getFullYear() <= state.settings.gardenLastYear) {
      const yearEarnings = calculateGardenYearEarnings(
        config,
        state,
        wallet,
        currentDate,
        yearEarningsMap
      );
      yearEarningsMap[currentDate.getFullYear()] = yearEarnings;
      const newDate = new Date(currentDate.getFullYear() + 1, 0, 1);
      currentDate = newDate;
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
  totalYearHarvestedInDripBUSDLP: number;
  totalYearHarvestedInCurrency: number;
  seedsPerDayEndOfYear: number;
  seedsLostForYear: number;
  seedsLostForYearInCurrency: number;
  plantBalanceEndOfYear: number;
  totalYearEarningsInDripBUSDLP: number;
  totalYearEarningsInCurrency: number;
};

function calculateGardenYearEarnings(
  config: Config,
  state: AppState,
  wallet: WalletState,
  startDate: Date,
  accumYearEarnings?: Record<number, GardenYearEarnings>
): GardenYearEarnings {
  const monthOffset = startDate.getMonth();
  // For example, 12 - 11 gives 1 month in year if the start date is December.
  const monthsInYear = 12 - startDate.getMonth();
  const monthEarningsSeed: Record<number, GardenMonthEarningsAndInfo> = {};
  const monthEarningDates = [...Array(monthsInYear)].map((_, i) => {
    if (i === 0) {
      return startDate;
    }
    return new Date(startDate.getFullYear(), monthOffset + i, 1);
  });
  const lastMonthOfPrevYearEarnings =
    accumYearEarnings?.[startDate.getFullYear() - 1]?.monthEarnings[11];
  const lastYearEarnings = accumYearEarnings?.[startDate.getFullYear() - 1];
  const monthEarningsMap = monthEarningDates.reduce(
    calculateGardenMonthEarnings(
      config,
      state,
      wallet,
      lastMonthOfPrevYearEarnings
    ),
    monthEarningsSeed
  );

  const seed: YearEarningsSummary = {
    totalYearHarvestedInDripBUSDLP: 0,
    totalYearHarvestedInCurrency: 0,
    seedsPerDayEndOfYear: 0,
    seedsLostForYear: 0,
    seedsLostForYearInCurrency: 0,
    plantBalanceEndOfYear: 0,
    totalYearEarningsInDripBUSDLP: 0,
    totalYearEarningsInCurrency: 0,
  };
  const {
    totalYearHarvestedInDripBUSDLP,
    totalYearHarvestedInCurrency,
    seedsPerDayEndOfYear,
    seedsLostForYear,
    seedsLostForYearInCurrency,
    plantBalanceEndOfYear,
    totalYearEarningsInDripBUSDLP,
    totalYearEarningsInCurrency,
  } = Object.values(monthEarningsMap).reduce(
    (accum, monthEarnings): YearEarningsSummary => {
      return {
        totalYearHarvestedInDripBUSDLP:
          accum.totalYearHarvestedInDripBUSDLP +
          monthEarnings.monthClaimedInDripBUSDLP,
        totalYearHarvestedInCurrency:
          accum.totalYearHarvestedInCurrency +
          monthEarnings.monthClaimedInCurrency,
        // Seeds per day is an accumulating value that is a balance that grows
        // as you sow seeds (compound).
        seedsPerDayEndOfYear: monthEarnings.seedsPerDayEndOfMonth,
        seedsLostForYear:
          accum.seedsLostForYear + monthEarnings.seedsLostForMonth,
        seedsLostForYearInCurrency:
          accum.seedsLostForYearInCurrency +
          monthEarnings.seedsLostForMonthInCurrency,
        plantBalanceEndOfYear: monthEarnings.plantBalanceEndOfMonth,
        totalYearEarningsInDripBUSDLP:
          accum.totalYearEarningsInDripBUSDLP +
          monthEarnings.monthEarningsInDripBUSDLP,
        totalYearEarningsInCurrency:
          accum.totalYearEarningsInCurrency +
          monthEarnings.monthEarningsInCurrency,
      };
    },
    seed
  );

  return {
    year: startDate.getFullYear(),
    monthEarnings: monthEarningsMap,
    totalYearHarvestedInDripBUSDLP,
    totalYearHarvestedInCurrency,
    accumYearHarvestedInDripBUSDLP:
      (lastYearEarnings?.accumYearHarvestedInDripBUSDLP ?? 0) +
      totalYearHarvestedInDripBUSDLP,
    accumYearHarvestedInCurrency:
      (lastYearEarnings?.accumYearHarvestedInCurrency ?? 0) +
      totalYearHarvestedInCurrency,
    seedsPerDayEndOfYear,
    seedsLostForYear,
    seedsLostForYearInCurrency,
    plantBalanceEndOfYear,
    totalYearEarningsInDripBUSDLP,
    totalYearEarningsInCurrency,
  };
}

type MonthEarningsCalculator = (
  accum: Record<string, GardenMonthEarningsAndInfo>,
  date: Date
) => Record<number, GardenMonthEarningsAndInfo>;

const tokenValueProvider = createTokenValueProvider();

function calculateGardenMonthEarnings(
  config: Config,
  state: AppState,
  wallet: WalletState,
  lastMonthOfPrevYearEarnings?: GardenMonthEarningsAndInfo
): MonthEarningsCalculator {
  return (accum: Record<number, GardenMonthEarningsAndInfo>, date: Date) => {
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
    const lastDripBUSDLPValueInCurrentWalletTimestamp = Object.entries(
      wallet.monthInputs
    ).reduce((prevTimestamp, [monthInputKey, { gardenValues }]) => {
      const dripBUSDLPValue = gardenValues?.dripBUSDLPValue;
      if (dripBUSDLPValue && dripBUSDLPValue > 0) {
        const timestamp = Number.parseInt(
          moment(monthInputKey, "DD/MM/YYYY").format("x")
        );
        return timestamp > prevTimestamp ? timestamp : prevTimestamp;
      }
      return prevTimestamp;
    }, /* earliest wallet start date is the seed date to fall back on */ earliestWalletStartTimestamp);
    const trendTargetDripBUSDLPValue = determineTrendTargetDripBUSDLPValue(
      state.settings
    );
    const dripBUSDLPValueForMonth =
      wallet.monthInputs[monthInputsKey]?.gardenValues?.dripBUSDLPValue ??
      tokenValueProvider.getValueForMonth(
        new Date(earliestWalletStartTimestamp),
        date,
        getLastCustomDripBUSDLPValue(wallet, config.defaultDripBUSDLPValue),
        trendTargetDripBUSDLPValue,
        state.settings.dripBUSDLPValueTrend,
        state.settings.gardenTrendPeriod,
        new Date(lastDripBUSDLPValueInCurrentWalletTimestamp)
      );

    // Same for every day of the month, does not fluctuate like the
    // DRIP/BUSD LP token value.
    // Could be more realistic to make the plant fraction fluctuate
    // from day to day as well?
    const plantDripBUSDLPFractionForMonth =
      wallet.monthInputs[monthInputsKey]?.gardenValues
        ?.plantDripBUSDLPFraction ??
      decliningPlantLPRatioValue(
        lastMonthOfPrevYearEarnings?.plantDripBUSDLPFractionForMonth
          ? Math.min(
              config.defaultMaxPlantDripBUSDLPFraction,
              lastMonthOfPrevYearEarnings?.plantDripBUSDLPFractionForMonth
            )
          : config.defaultMaxPlantDripBUSDLPFraction,
        config.minPlantDripBUSDLPFraction,
        date,
        new Date(earliestWalletStartTimestamp),
        moment(`31/12/${state.settings.gardenLastYear}`, "DD/MM/YYYY").toDate()
      );

    const lastDayOfPrevMonthEarnings =
      accum[month - 1]?.dayEarnings[
        getDaysInMonth(new Date(accum[month - 1].month))
      ] ??
      lastMonthOfPrevYearEarnings?.dayEarnings?.[
        getDaysInMonth(new Date(lastMonthOfPrevYearEarnings.month))
      ];
    const dayEarningsSeed: Record<number, GardenDayEarnings> = {};
    const dayEarnings = dayEarningDates.reduce(
      calculateGardenDayEarnings(
        config,
        state,
        wallet,
        dripBUSDLPValueForMonth,
        plantDripBUSDLPFractionForMonth,
        lastDayOfPrevMonthEarnings
      ),
      dayEarningsSeed
    );

    const {
      monthEarningsInDripBUSDLP,
      monthEarningsInCurrency,
      monthReinvestedInDripBUSDLP,
      monthReinvestedInCurrency,
      monthClaimedInDripBUSDLP,
      monthClaimedInCurrency,
      monthEstimatedGasFees,
      seedsLostForMonth,
      seedsLostForMonthInCurrency,
    } = sumDayAmountsForMonth(dayEarnings);

    const plantBalanceEndOfMonth = dayEarnings[totalDaysInMonth].plantsBalance;
    const seedsPerDayEndOfMonth = dayEarnings[totalDaysInMonth].seedsPerDay;

    return {
      ...accum,
      [month]: {
        month: date.getTime(),
        plantBalanceEndOfMonth,
        seedsPerDayEndOfMonth,
        monthEarningsInDripBUSDLP,
        monthEarningsInCurrency,
        monthReinvestedInDripBUSDLP,
        monthReinvestedInCurrency,
        monthClaimedInDripBUSDLP,
        monthClaimedInCurrency,
        dayEarnings,
        seedsLostForMonth,
        seedsLostForMonthInCurrency,
        monthEstimatedGasFees,
        dripBUSDLPValueForMonth,
        plantDripBUSDLPFractionForMonth,
      },
    };
  };
}

type SummedMonthAmounts = Pick<
  GardenMonthEarningsAndInfo,
  | "monthEarningsInDripBUSDLP"
  | "monthEarningsInCurrency"
  | "monthReinvestedInDripBUSDLP"
  | "monthReinvestedInCurrency"
  | "monthClaimedInDripBUSDLP"
  | "monthClaimedInCurrency"
  | "monthEstimatedGasFees"
  | "seedsLostForMonth"
  | "seedsLostForMonthInCurrency"
>;

function sumDayAmountsForMonth(
  dayEarnings: Record<number, GardenDayEarnings>
): SummedMonthAmounts {
  const seed: SummedMonthAmounts = {
    monthEarningsInDripBUSDLP: 0,
    monthEarningsInCurrency: 0,
    monthReinvestedInDripBUSDLP: 0,
    monthReinvestedInCurrency: 0,
    monthClaimedInDripBUSDLP: 0,
    monthClaimedInCurrency: 0,
    monthEstimatedGasFees: 0,
    seedsLostForMonth: 0,
    seedsLostForMonthInCurrency: 0,
  };
  return Object.values(dayEarnings).reduce((accum, earningsForDay) => {
    return {
      monthEarningsInDripBUSDLP:
        accum.monthEarningsInDripBUSDLP + earningsForDay.earningsInDripBUSDLP,
      monthEarningsInCurrency:
        accum.monthEarningsInCurrency + earningsForDay.earningsInCurrency,
      monthReinvestedInDripBUSDLP:
        accum.monthReinvestedInDripBUSDLP + earningsForDay.reinvestInDripBUSDLP,
      monthReinvestedInCurrency:
        accum.monthReinvestedInCurrency + earningsForDay.reinvestInCurrency,
      monthClaimedInDripBUSDLP:
        accum.monthClaimedInDripBUSDLP + earningsForDay.claimInDripBUSDLP,
      monthClaimedInCurrency:
        accum.monthClaimedInCurrency + earningsForDay.claimInCurrency,
      monthEstimatedGasFees:
        accum.monthEstimatedGasFees + earningsForDay.estimatedGasFees,
      seedsLostForMonth: accum.seedsLostForMonth + earningsForDay.seedsLost,
      seedsLostForMonthInCurrency:
        accum.seedsLostForMonthInCurrency + earningsForDay.seedsLostInCurrency,
    };
  }, seed);
}

function determineTrendTargetDripBUSDLPValue(settings: PlanSettings): number {
  if (settings.dripBUSDLPValueTrend === "uptrend") {
    return settings.dripBUSDLPUptrendMaxValue;
  }

  if (settings.dripBUSDLPValueTrend === "downtrend") {
    return settings.dripBUSDLPDowntrendMinValue;
  }

  return settings.dripBUSDLPStabilisesAt;
}

function getLastCustomDripBUSDLPValue(
  wallet: WalletState,
  fallbackDripBUSDLPValue: number
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
    ? wallet.monthInputs[monthDates[monthDates.length - 1]].gardenValues
        ?.dripBUSDLPValue ?? fallbackDripBUSDLPValue
    : fallbackDripBUSDLPValue;
}

type GardenDayEarningsCalculator = (
  accum: Record<string, GardenDayEarnings>,
  date: Date
) => Record<number, GardenDayEarnings>;

const gardenEmptyDayEarnings: GardenDayEarnings = {
  earningsInDripBUSDLP: 0,
  earningsInCurrency: 0,
  reinvestInDripBUSDLP: 0,
  reinvestInCurrency: 0,
  claimInDripBUSDLP: 0,
  claimInCurrency: 0,
  dripBUSDLPValueOnDay: 0,
  plantDripBUSDLPFractionOnDay: 0,
  plantsBalance: 0,
  seedsPerDay: 0,
  estimatedGasFees: 0,
  seedsLost: 0,
  seedsLostInCurrency: 0,
  plantsGrown: 0,
  seedsAccumulatedFromPreviousDaySchedules: 0,
  accumSeedsToHarvestOrSow: 0,
  accumSeedsToHarvestOrSowInDripBUSDLP: 0,
  isHarvestDay: false,
  leaveRewardsToAccumulate: false,
  isSowDay: false,
  sowHarvestSchedule: [],
  // Sow and harvest schedule actions for other days
  // captured by optimising the day's sow/harvest schedule.
  sowHarvestScheduleSpillOver: [],
  lastSowTimestamp: 0,
  lastHarvestTimestamp: 0,
  lastDepositTimestamp: 0,
};

function calculateGardenDayEarnings(
  config: Config,
  state: AppState,
  wallet: WalletState,
  dripBUSDLPValueForMonth: number,
  plantDripBUSDLPFractionForDay: number,
  lastDayOfPrevMonthEarnings?: GardenDayEarnings
): GardenDayEarningsCalculator {
  return (accum: Record<number, GardenDayEarnings>, date: Date) => {
    const dayInMonth = date.getDate();
    const prevDayEarningsData =
      accum[dayInMonth - 1] ??
      lastDayOfPrevMonthEarnings ??
      gardenEmptyDayEarnings;
    // Format of custom month input keys is dd/mm/yyyy.
    const monthInputsKey = moment(date).format("01/MM/YYYY");

    const monthInput = wallet.monthInputs[monthInputsKey];

    const dripBUSDLPValueForDay = tokenValueProvider.applyVariance(
      dripBUSDLPValueForMonth
    );

    const gardenYieldPercentangeForDay =
      monthInput?.gardenValues?.averageGardenYieldPercentage ??
      config.defaultAverageGardenYieldPercentage;

    const plantsLastAddedAt = Math.max(
      prevDayEarningsData.lastSowTimestamp,
      prevDayEarningsData.lastDepositTimestamp
    );

    const lastActionTimestamp = Math.max(
      prevDayEarningsData.lastSowTimestamp,
      prevDayEarningsData.lastHarvestTimestamp,
      prevDayEarningsData.lastDepositTimestamp
    );

    const midDayTimestamp = Number.parseInt(
      moment(date)
        .set({
          hour: 12,
          minute: 0,
          seconds: 0,
        })
        .format("x")
    );

    const depositsToday = (monthInput?.gardenDeposits ?? []).filter((deposit) =>
      moment(new Date(deposit.timestamp)).isSame(moment(date), "day")
    );
    depositsToday.sort((a, b) => a.timestamp - b.timestamp);
    const depositsTodayInSeeds = depositsToday.map((deposit) => ({
      amountInSeeds: state.fiatMode
        ? calculateCurrencyDepositInSeeds(
            deposit.amountInCurrency,
            dripBUSDLPValueForDay,
            plantDripBUSDLPFractionForDay,
            config.seedsPerPlant,
            // We're making an assumption here that every deposit
            // ultimately comes from buying crypto with fiat
            // in a centralised exchange.
            config.cexFeePercentage,
            // Extra buffer fees for trades along the way to getting DRIP/BUSD LP.
            config.depositBufferFees
          )
        : seedsFromDripBUSDLP(
            deposit.amountInTokens ?? 0,
            config.seedsPerPlant,
            plantDripBUSDLPFractionForDay
          ),
      timestamp: deposit.timestamp,
    }));

    const seedsUpToMidDay = calculateSeedsUpTo(
      plantsLastAddedAt,
      midDayTimestamp,
      // Seeds per day balance from the last time plants were added
      // by either depositing (buying plants) or sowing seeds (compounding).
      prevDayEarningsData.seedsPerDay,
      prevDayEarningsData.plantsBalance,
      gardenYieldPercentangeForDay,
      config.seedsPerPlant,
      // The set of deposits for today to be accounted for in the calculation
      // of seeds up to mid-day.
      depositsTodayInSeeds
    );
    const seedsUpToMidDayInDripBUSDLP = seedsToDripBUSDLP(
      seedsUpToMidDay,
      config.seedsPerPlant,
      plantDripBUSDLPFractionForDay
    );

    const {
      schedule,
      isHarvestDay,
      isSowDay,
      seedsAccumulated: seedsAccumulatedFromScheduleCreation,
    } = determineSowHarvestScheduleAndInfo(
      monthInput?.customGardenDayActions,
      prevDayEarningsData,
      date,
      midDayTimestamp,
      state,
      monthInput?.gardenReinvest ?? config.defaultGardenReinvest,
      dripBUSDLPValueForDay,
      determineSowFrequency(
        monthInput?.sowStrategy,
        state.settings.defaultGardenSowFrequency
      ),
      // This is used for harvest days when a custom schedule is not
      // being used for the day. The default is to harvest mid-day
      // on harvest days.
      prevDayEarningsData.accumSeedsToHarvestOrSowInDripBUSDLP +
        seedsUpToMidDayInDripBUSDLP,
      gardenYieldPercentangeForDay,
      config.seedsPerPlant,
      plantDripBUSDLPFractionForDay,
      depositsTodayInSeeds
    );

    const { daySchedule, scheduleSpillOver } =
      splitScheduleAndCombineFromPrevSpillOver(
        schedule,
        date,
        prevDayEarningsData.sowHarvestScheduleSpillOver
      );

    const {
      earningsInDripBUSDLP,
      reinvestInDripBUSDLP,
      claimInDripBUSDLP,
      plantsBalance,
      seedsPerDay,
      seedsLost,
      plantsGrown,
      accumSeedsToHarvestOrSow,
      accumSeedsToHarvestOrSowInDripBUSDLP,
    } = calculateScheduleEarningsAndLosses(
      daySchedule,
      depositsToday,
      lastActionTimestamp,
      dripBUSDLPValueForDay,
      plantDripBUSDLPFractionForDay,
      gardenYieldPercentangeForDay,
      prevDayEarningsData.plantsBalance,
      prevDayEarningsData.seedsPerDay,
      config.seedsPerPlant,
      // Every day accumulated seeds DRIP/BUSD LP value is re-calculated
      // as the value in DRIP/BUSD LP isn't realised until an action is taken.
      prevDayEarningsData.accumSeedsToHarvestOrSow,
      config.cexFeePercentage,
      config.depositBufferFees,
      state.fiatMode
    );

    const sowGasFee =
      daySchedule.filter((action) => action.action === "sow").length *
      state.settings.gardenAverageSowGasFee;
    const harvestGasFee =
      daySchedule.filter((action) => action.action === "harvest").length *
      state.settings.gardenAverageDepositHarvestGasFee;
    const estimatedGasFees =
      depositsToday.length > 0
        ? sowGasFee +
          state.settings.gardenAverageDepositHarvestGasFee *
            depositsToday.length
        : sowGasFee + harvestGasFee;

    return {
      ...accum,
      [dayInMonth]: {
        earningsInDripBUSDLP,
        earningsInCurrency: earningsInDripBUSDLP * dripBUSDLPValueForDay,
        reinvestInDripBUSDLP,
        reinvestInCurrency: reinvestInDripBUSDLP * dripBUSDLPValueForDay,
        claimInDripBUSDLP,
        claimInCurrency: claimInDripBUSDLP * dripBUSDLPValueForDay,
        dripBUSDLPValueOnDay: dripBUSDLPValueForDay,
        plantDripBUSDLPFractionOnDay: plantDripBUSDLPFractionForDay,
        // Plant balance at end of the day.
        plantsBalance,
        // Seeds per day by end of the day.
        seedsPerDay,
        seedsAccumulatedFromPreviousDaySchedules:
          seedsAccumulatedFromScheduleCreation,
        estimatedGasFees,
        seedsLost,
        seedsLostInCurrency:
          seedsToDripBUSDLP(
            seedsLost,
            config.seedsPerPlant,
            plantDripBUSDLPFractionForDay
          ) * dripBUSDLPValueForDay,
        plantsGrown,
        // The accumulated daily rewards from the current day AND previous days
        // that have not yet been compounded or claimed!
        // This is in raw seeds!
        accumSeedsToHarvestOrSow,
        // Accum seeds in DRIP/BUSD LP tokens for the day.
        // If the value changes day to day while accumulating
        // then the value of the accumulated seeds from previous days
        // will also change!
        accumSeedsToHarvestOrSowInDripBUSDLP,
        isHarvestDay,
        leaveRewardsToAccumulate: !isSowDay && !isHarvestDay,
        isSowDay,
        // Sow/harvest schedule for the day, this is an array to allow for
        // a sow/harvest schedule for multiple times a day.
        sowHarvestSchedule: daySchedule,
        sowHarvestScheduleSpillOver: scheduleSpillOver,
        lastSowTimestamp:
          getLastTimestamp(daySchedule, "sow") ??
          prevDayEarningsData.lastSowTimestamp,
        lastHarvestTimestamp:
          getLastTimestamp(daySchedule, "harvest") ??
          prevDayEarningsData.lastDepositTimestamp,
        // deposits today are sorted!
        lastDepositTimestamp:
          depositsToday.length > 0
            ? depositsToday[depositsToday.length - 1].timestamp
            : prevDayEarningsData.lastDepositTimestamp,
      },
    };
  };
}

type SplitSchedule = {
  daySchedule: GardenDayAction[];
  scheduleSpillOver: GardenDayAction[];
};

function splitScheduleAndCombineFromPrevSpillOver(
  schedule: GardenDayAction[],
  dayDate: Date,
  prevDaySpillOver: GardenDayAction[]
): SplitSchedule {
  const { daySchedule, scheduleSpillOver } = schedule.reduce(
    (accum, action) => {
      const sameDay = moment(dayDate).isSame(
        moment(new Date(action.timestamp)),
        "day"
      );
      if (sameDay) {
        return {
          ...accum,
          daySchedule: [...accum.daySchedule, action],
        };
      }
      return {
        ...accum,
        scheduleSpillOver: [...accum.scheduleSpillOver, action],
      };
    },
    {
      daySchedule: [],
      scheduleSpillOver: [],
    } as SplitSchedule
  );
  const finalDaySchedule = [
    ...daySchedule,
    ...prevDaySpillOver.filter(({ timestamp }) =>
      moment(dayDate).isSame(moment(new Date(timestamp)), "day")
    ),
  ];
  finalDaySchedule.sort((a, b) => a.timestamp - b.timestamp);

  return {
    daySchedule: schedule,
    scheduleSpillOver,
  };
}

type DayScheduleEarningsAndLosses = {
  earningsInDripBUSDLP: number;
  reinvestInDripBUSDLP: number;
  claimInDripBUSDLP: number;
  plantsBalance: number;
  seedsPerDay: number;
  seedsLost: number;
  plantsGrown: number;
  accumSeedsToHarvestOrSow: number;
  accumSeedsToHarvestOrSowInDripBUSDLP: number;
};

function calculateScheduleEarningsAndLosses(
  schedule: GardenDayAction[],
  depositsToday: Deposit[],
  lastActionTimestamp: number,
  dripBUSDLPValueForDay: number,
  plantDripBUSDLPFractionForDay: number,
  gardenYieldPercentageForDay: number,
  prevPlantBalance: number,
  prevSeedsPerDay: number,
  seedsPerPlant: number,
  accumSeedsToHarvestOrSow: number,
  cexFeePercentage: number,
  depositBufferFees: number,
  fiatMode: boolean
): DayScheduleEarningsAndLosses {
  const combinedSchedule: (GardenDayAction | Deposit)[] = [
    ...schedule,
    ...depositsToday,
  ];
  combinedSchedule.sort((a, b) => a.timestamp - b.timestamp);

  const seed: DayScheduleEarningsAndLosses & { prevTimestamp: number } = {
    earningsInDripBUSDLP: 0,
    reinvestInDripBUSDLP: 0,
    claimInDripBUSDLP: 0,
    plantsBalance: prevPlantBalance,
    seedsPerDay: prevSeedsPerDay,
    seedsLost: 0,
    plantsGrown: 0,
    accumSeedsToHarvestOrSow,
    accumSeedsToHarvestOrSowInDripBUSDLP: seedsToDripBUSDLP(
      accumSeedsToHarvestOrSow,
      seedsPerPlant,
      plantDripBUSDLPFractionForDay
    ),
    prevTimestamp: lastActionTimestamp,
  };
  const { prevTimestamp: _prevTimestamp, ...results } = combinedSchedule.reduce(
    (accum, action) => {
      const seedsEarnedInTimeWindow = calculateSeedsBetweenTimestamps(
        accum.prevTimestamp,
        action.timestamp,
        accum.seedsPerDay
      );
      const earningsInDripBUSDLPForWindow = seedsToDripBUSDLP(
        seedsEarnedInTimeWindow,
        seedsPerPlant,
        plantDripBUSDLPFractionForDay
      );

      if (isDeposit(action)) {
        const newPlantsBalance =
          accum.plantsBalance +
          (fiatMode
            ? calculateCurrencyDepositInPlants(
                action.amountInCurrency,
                dripBUSDLPValueForDay,
                plantDripBUSDLPFractionForDay,
                cexFeePercentage,
                depositBufferFees
              )
            : plantsFromDripBUSDLP(
                action.amountInTokens ?? 0,
                plantDripBUSDLPFractionForDay
              ));
        const newSeedsPerDay =
          gardenYieldPercentageForDay * newPlantsBalance * seedsPerPlant;

        // Add seeds from prev timestamp to deposit timestamp to the accumulated
        // seeds available using the previous seeds per day rate.
        const newAccumSeedsToHarvestOrSow =
          accum.accumSeedsToHarvestOrSow + seedsEarnedInTimeWindow;
        return {
          ...accum,
          // Earnings are just for each action in the schedule for today,
          // we do NOT include accumulated seeds from previous days for this
          // calculation!
          earningsInDripBUSDLP:
            accum.earningsInDripBUSDLP + earningsInDripBUSDLPForWindow,
          plantsBalance: newPlantsBalance,
          seedsPerDay: newSeedsPerDay,
          accumSeedsToHarvestOrSow: newAccumSeedsToHarvestOrSow,
          accumSeedsToHarvestOrSowInDripBUSDLP: seedsToDripBUSDLP(
            newAccumSeedsToHarvestOrSow,
            seedsPerPlant,
            plantDripBUSDLPFractionForDay
          ),
          prevTimestamp: action.timestamp,
        };
      }

      if (action.action === "harvest") {
        const seedsToHarvest =
          accum.accumSeedsToHarvestOrSow + seedsEarnedInTimeWindow;
        return {
          ...accum,
          // Earnings are just for each action in the schedule for today,
          // we do NOT include accumulated seeds from previous days for this
          // calculation!
          earningsInDripBUSDLP:
            accum.earningsInDripBUSDLP + earningsInDripBUSDLPForWindow,
          // Accumulate to allow for the case when a user provides their own schedule
          // where they might harvest multiple times in a day.
          claimInDripBUSDLP:
            accum.claimInDripBUSDLP +
              // You can only harvest when at least one whole plant's worth of seeds is ready to be sold
              // or compounded.
              seedsToHarvest >=
            seedsPerPlant
              ? seedsToDripBUSDLP(
                  seedsToHarvest,
                  seedsPerPlant,
                  plantDripBUSDLPFractionForDay
                )
              : 0,
          // Harvesting is claiming all accumulated seeds available
          // up to this point. If we can't harvest then accumulate!
          accumSeedsToHarvestOrSow:
            seedsToHarvest < seedsPerPlant ? seedsToHarvest : 0,
          accumSeedsToHarvestOrSowInDripBUSDLP:
            seedsToHarvest < seedsPerPlant
              ? seedsToDripBUSDLP(
                  seedsToHarvest,
                  seedsPerPlant,
                  plantDripBUSDLPFractionForDay
                )
              : 0,
          prevTimestamp: action.timestamp,
        };
      }

      // Action is sow at this point if a whole plant can be grown!
      const seedsToSowOrAccumulate =
        accum.accumSeedsToHarvestOrSow + seedsEarnedInTimeWindow;
      const newPlantsGrown = getWholePlantsFromSeeds(
        seedsToSowOrAccumulate,
        seedsPerPlant
      );
      const newSeedsLost = getSeedsLost(seedsToSowOrAccumulate, seedsPerPlant);
      const newPlantsBalanceFromSowing = accum.plantsBalance + newPlantsGrown;
      return {
        ...accum,
        plantsGrown: accum.plantsGrown + newPlantsGrown,
        plantsBalance: newPlantsBalanceFromSowing,
        seedsPerDay:
          gardenYieldPercentageForDay *
          newPlantsBalanceFromSowing *
          seedsPerPlant,
        seedsLost:
          newPlantsGrown > 0 ? accum.seedsLost + newSeedsLost : accum.seedsLost,
        reinvestInDripBUSDLP:
          accum.reinvestInDripBUSDLP +
          plantsToDripBUSDLP(newPlantsGrown, plantDripBUSDLPFractionForDay),
        // Earnings are just for each action in the schedule for today,
        // we do NOT include accumulated seeds from previous days for this
        // calculation!
        earningsInDripBUSDLP:
          accum.earningsInDripBUSDLP + earningsInDripBUSDLPForWindow,
        // sowing is consuming all accumulated seeds available
        // up to this point if at least 1 new plant can be grown. (Most compounded, some lost)
        accumSeedsToHarvestOrSow:
          newPlantsGrown > 0 ? 0 : seedsToSowOrAccumulate,
        accumSeedsToHarvestOrSowInDripBUSDLP:
          newPlantsGrown > 0
            ? 0
            : seedsToDripBUSDLP(
                seedsToSowOrAccumulate,
                seedsPerPlant,
                plantDripBUSDLPFractionForDay
              ),
        prevTimestamp: action.timestamp,
      };
    },
    seed
  );

  return results;
}

function isDeposit(input: Record<string, unknown>): input is Deposit {
  return !!(
    input.depositId &&
    input.dayOfMonth &&
    (typeof input.amountInCurrency === "number" ||
      typeof input.amountInTokens === "number") &&
    input.timestamp
  );
}

function getLastTimestamp(
  schedule: GardenDayAction[],
  action: GardenDayActionValue
): number | null {
  const scheduleForAction = schedule.filter(
    (dayAction) => dayAction.action === action
  );
  if (scheduleForAction.length === 0) {
    return null;
  }
  scheduleForAction.sort((a, b) => a.timestamp - b.timestamp);
  return scheduleForAction[scheduleForAction.length - 1].timestamp;
}

function determineSowFrequency(
  sowStrategy: "default" | SowFrequency | undefined,
  defaultSowFrequency: SowFrequency
): SowFrequency {
  if (!sowStrategy || sowStrategy === "default") {
    return defaultSowFrequency;
  }
  return sowStrategy;
}

type DepositInSeeds = {
  timestamp: number;
  amountInSeeds: number;
};

function calculateSeedsUpTo(
  plantsLastAddedAt: number,
  midDayTimestamp: number,
  seedsPerDay: number,
  plantBalance: number,
  gardenPercentageYieldEstimate: number,
  seedsPerPlant: number,
  depositsToday: DepositInSeeds[]
): number {
  const depositsBeforeMidDay = depositsToday.filter(
    (deposit) => deposit.timestamp < midDayTimestamp
  );
  depositsBeforeMidDay.sort((a, b) => a.timestamp - b.timestamp);
  if (depositsBeforeMidDay.length === 0) {
    return calculateSeedsBetweenTimestamps(
      plantsLastAddedAt,
      midDayTimestamp,
      seedsPerDay
    );
  }
  const seed = {
    currentPlantBalance: plantBalance,
    accumSeeds: calculateSeedsBetweenTimestamps(
      plantsLastAddedAt,
      depositsBeforeMidDay[0].timestamp,
      seedsPerDay
    ),
  };
  const { accumSeeds } = depositsBeforeMidDay.reduce((prev, deposit, i) => {
    const startTimestamp = deposit.timestamp;
    const endTimestamp =
      i + 1 < depositsBeforeMidDay.length
        ? depositsBeforeMidDay[i + 1].timestamp
        : midDayTimestamp;
    const newPlantBalance =
      prev.currentPlantBalance +
      getWholePlantsFromSeeds(deposit.amountInSeeds, seedsPerPlant);
    const newSeedsPerDay =
      gardenPercentageYieldEstimate * newPlantBalance * seedsPerPlant;
    return {
      currentPlantBalance: newPlantBalance,
      accumSeeds:
        prev.accumSeeds +
        calculateSeedsBetweenTimestamps(
          startTimestamp,
          endTimestamp,
          newSeedsPerDay
        ),
    };
  }, seed);
  return accumSeeds;
}

function getWholePlantsFromSeeds(
  seedCount: number,
  seedsPerPlant: number
): number {
  return Math.floor(seedCount / seedsPerPlant);
}

function getSeedsLost(seedCount: number, seedsPerPlant: number): number {
  return seedCount % seedsPerPlant;
}

function calculateSeedsBetweenTimestamps(
  startTimestamp: number,
  endTimestamp: number,
  seedsPerDay: number
): number {
  const millisecondsBetween = endTimestamp - startTimestamp;
  const secondsBetween = millisecondsBetween / 1000;
  const seedsPerSecond = seedsPerDay / 24 / 60 / 60;
  return seedsPerSecond * secondsBetween;
}

function calculateCurrencyDepositInSeeds(
  amountInCurrency: number,
  dripBUSDLPValueForDay: number,
  plantDripBUSDLPFractionForDay: number,
  seedsPerPlant: number,
  // We're making an assumption here that every deposit
  // ultimately comes from buying crypto with fiat
  // in a centralised exchange.
  cexFeePercentage: number,
  depositBufferFees: number
): number {
  return (
    calculateCurrencyDepositInPlants(
      amountInCurrency,
      dripBUSDLPValueForDay,
      plantDripBUSDLPFractionForDay,
      cexFeePercentage,
      depositBufferFees
    ) * seedsPerPlant
  );
}

function calculateCurrencyDepositInPlants(
  amountInCurrency: number,
  dripBUSDLPValueForDay: number,
  plantDripBUSDLPFractionForDay: number,
  // We're making an assumption here that every deposit
  // ultimately comes from buying crypto with fiat
  // in a centralised exchange.
  cexFeePercentage: number,
  depositBufferFees: number
): number {
  const depositAfterFeeDeduction =
    amountInCurrency - amountInCurrency * cexFeePercentage - depositBufferFees;
  const depositInDripBUSDLP = depositAfterFeeDeduction / dripBUSDLPValueForDay;
  return plantsFromDripBUSDLP(
    depositInDripBUSDLP,
    plantDripBUSDLPFractionForDay
  );
}

function seedsFromDripBUSDLP(
  amount: number,
  seedsPerPlant: number,
  plantDripBUSDLPFractionForDay: number
): number {
  return (
    plantsFromDripBUSDLP(amount, plantDripBUSDLPFractionForDay) * seedsPerPlant
  );
}

function plantsFromDripBUSDLP(
  amount: number,
  plantDripBUSDLPFractionForDay: number
): number {
  if (amount === 0) {
    return 0;
  }
  // Whole plants only, the remainder will remain in LP token balance!
  return Math.floor(amount / plantDripBUSDLPFractionForDay);
}

function seedsToDripBUSDLP(
  seedCount: number,
  seedsPerPlant: number,
  plantDripBUSDLPFractionForDay: number
) {
  // Plants can be fractions for this use-case as plants as a value
  // is only being used as an intermediary between seeds and LP tokens.
  const plantCount = seedCount / seedsPerPlant;
  return plantsToDripBUSDLP(plantCount, plantDripBUSDLPFractionForDay);
}

function plantsToDripBUSDLP(
  plantCount: number,
  plantDripBUSDLPFractionForDay: number
): number {
  return plantDripBUSDLPFractionForDay * plantCount;
}

type ScheduleAndInfo = {
  schedule: GardenDayAction[];
  isSowDay: boolean;
  isHarvestDay: boolean;
  seedsAccumulated: number;
};

/**
 * Produces an ordered sow/harvest schedule
 * for the day along with extra info calculated
 * to be shared.
 */
function determineSowHarvestScheduleAndInfo(
  customGardenDayActions: Record<string, GardenDayAction[]> | undefined,
  prevDayEarningsData: GardenDayEarnings,
  date: Date,
  midDayTimestamp: number,
  state: AppState,
  gardenReinvest: number,
  dripBUSDLPValueForDay: number,
  sowFrequency: SowFrequency,
  accumSeedsToHarvestInDripBUSDLP: number,
  gardenPercentageYieldEstimate: number,
  seedsPerPlant: number,
  plantDripBUSDLPFractionForDay: number,
  depositsToday: DepositInSeeds[]
): ScheduleAndInfo {
  const dateFormatted = moment(date).format("DD/MM/YYYY");
  if (customGardenDayActions && customGardenDayActions[dateFormatted]) {
    // Leave the original inputs alone, sort a copy instead!
    const gardenDayActionsCopy = [...customGardenDayActions[dateFormatted]];
    gardenDayActionsCopy.sort((a, b) => a.timestamp - b.timestamp);
    return {
      schedule: gardenDayActionsCopy,
      isSowDay: !!gardenDayActionsCopy.find(({ action }) => action === "sow"),
      isHarvestDay: !!gardenDayActionsCopy.find(
        ({ action }) => action === "harvest"
      ),
      seedsAccumulated: 0,
    };
  }

  // When a user doesn't provide a custom schedule for the day,
  // we fall back to using the garden settings where a percentage
  // of the month is purely for sowing and the rest purely for harvesting.
  const dayDedicatedToAction = determineDedicatedActionForDay(
    date,
    state,
    gardenReinvest,
    dripBUSDLPValueForDay,
    accumSeedsToHarvestInDripBUSDLP,
    new Date(prevDayEarningsData.lastSowTimestamp),
    sowFrequency
  );

  if (dayDedicatedToAction === "harvest") {
    return {
      isHarvestDay: true,
      isSowDay: false,
      schedule: [
        {
          action: "harvest",
          timestamp: midDayTimestamp,
        },
      ],
      seedsAccumulated: 0,
    };
  }

  if (dayDedicatedToAction === "doNothing") {
    return {
      isHarvestDay: false,
      isSowDay: false,
      schedule: [],
      seedsAccumulated: 0,
    };
  }

  const plantsLastAddedAt = Math.max(
    prevDayEarningsData.lastSowTimestamp,
    prevDayEarningsData.lastDepositTimestamp
  );

  const lastActionTimestamp = Math.max(
    prevDayEarningsData.lastSowTimestamp,
    prevDayEarningsData.lastHarvestTimestamp,
    prevDayEarningsData.lastDepositTimestamp
  );

  const { dayActions: schedule, seedsAccumulated } = calculateSowScheduleForDay(
    date,
    plantsLastAddedAt,
    lastActionTimestamp,
    dripBUSDLPValueForDay,
    sowFrequency,
    state,
    prevDayEarningsData,
    gardenPercentageYieldEstimate,
    seedsPerPlant,
    plantDripBUSDLPFractionForDay,
    depositsToday
  );

  return {
    schedule,
    isSowDay: schedule.length > 0,
    isHarvestDay: false,
    seedsAccumulated,
  };
}

type SowScheduleInfoForDay = {
  seedsAccumulated: number;
  dayActions: GardenDayAction[];
};

function calculateSowScheduleForDay(
  date: Date,
  plantsLastAddedAt: number,
  lastActionTimestamp: number,
  dripBUSDLPValueForDay: number,
  sowFrequency: SowFrequency,
  state: AppState,
  prevDayEarningsData: GardenDayEarnings,
  gardenPercentageYieldEstimate: number,
  seedsPerPlant: number,
  plantDripBUSDLPFractionForDay: number,
  depositsToday: DepositInSeeds[]
): SowScheduleInfoForDay {
  if (plantsLastAddedAt === 0 && depositsToday.length === 0) {
    // There is no action to take if no plants have been added to the garden
    // and no new deposits are coming in for the day!
    return { dayActions: [], seedsAccumulated: 0 };
  }

  const depositsTodaySorted = [...depositsToday];
  depositsTodaySorted.sort((a, b) => a.timestamp - b.timestamp);
  const { plantsBalance, seedsPerDay } = prevDayEarningsData;
  const { gardenAverageSowGasFee } = state.settings;

  // Get the most plants we can accumulate today and
  // sow once at the latest possible time we can today.
  // In the future, we could allow users to set a configurable
  // window of time in which they can sow in a day and we can maintain
  // full transparency on their standing with the seeds lost stats.
  // This feature would be useful for people who don't want to input
  // their own precise schedule every day.
  const endOfDayMoment = moment(date).set({
    hour: 23,
    minute: 59,
    second: 59,
  });
  const endOfDayTimestamp = Number.parseInt(endOfDayMoment.format("x"));
  const startOfDayMoment = moment(date).set({
    hour: 0,
    minute: 0,
    second: 0,
  });
  const startOfDayTimestamp = Number.parseInt(startOfDayMoment.format("x"));
  const isStartOfGarden = plantsLastAddedAt === 0;
  const firstDepositToday =
    depositsTodaySorted.length > 0 ? depositsTodaySorted[0] : null;
  let prevTimestamp = isStartOfGarden
    ? firstDepositToday?.timestamp ?? lastActionTimestamp
    : lastActionTimestamp;
  let prevOptimisedEndTimestamp: number | null = null;
  let plantsGrownToday = false;
  let plantsGrown = 0;
  let currentPlantBalance =
    isStartOfGarden && firstDepositToday
      ? getWholePlantsFromSeeds(firstDepositToday.amountInSeeds, seedsPerPlant)
      : plantsBalance;
  let currentSeedsPerDay = isStartOfGarden
    ? gardenPercentageYieldEstimate * currentPlantBalance * seedsPerPlant
    : seedsPerDay;
  // Make sure we pick up any seeds accumulated before the start of the day!
  let seedsAccumulated =
    prevDayEarningsData.seedsAccumulatedFromPreviousDaySchedules;

  // It becomes very inefficient very quickly to take one plant at a time
  // when you start getting to 100s
  // or 1000s of plants that can be grown each day!
  // For this reason the implementation gets the max whole plants it can get
  // between the set time windows.
  // For multiple times a day there are 2 time windows to keep things simple,
  // this essentially means multiple times a day = 2 times a day as any sort of algorithm
  // to determine how many time windows there should be would be pretty arbitrary.
  // For once a day or longer intervals this a single time window from the time the plants
  // were last added to the end of the day.
  // This can lose accuracy if deposits are timed in one of the time windows
  // as those deposits will be added for the next time window.
  // There will also be more tolerance for seed loss with this approach, users should
  // create their own day schedules for now to optimise their strategy to reduce seed loss!
  const timeWindows = createDayScheduleTimeWindows(
    // Time windows begin at 00:00 today!
    startOfDayTimestamp,
    endOfDayTimestamp,
    sowFrequency
  );

  // As we go, we need to optimise the time windows
  // to sow when we get enough for a whole plant!
  let optimisedTimeWindows: ScheduleTimeWindow[] = [];

  // todo: refactor to functional using reduce now we have predetermined time windows!
  for (const timeWindow of timeWindows) {
    // Priorities to reduce seed loss:
    // 1. previous optimised sow timestamp in the same day.
    // 2. last action timestamp from the previous day.
    // 3. start timestamp of current time window
    let optimisedStartTimestamp =
      prevOptimisedEndTimestamp ?? prevTimestamp ?? timeWindow.startTimestamp;
    // Factor in new deposits before the time window starts!
    const depositBeforeTimeWindow = depositsToday.find(
      depositBetweenTimestamps(prevTimestamp, optimisedStartTimestamp)
    );
    if (depositBeforeTimeWindow) {
      const newPlantsDeposited = getWholePlantsFromSeeds(
        depositBeforeTimeWindow.amountInSeeds,
        seedsPerPlant
      );
      currentPlantBalance += newPlantsDeposited;

      // Make the new start time that of the deposit and added any accumulated seeds
      // before the deposit.
      seedsAccumulated += getSeedsBetweenTimestamps(
        currentSeedsPerDay,
        optimisedStartTimestamp,
        depositBeforeTimeWindow.timestamp
      );
      optimisedStartTimestamp = depositBeforeTimeWindow.timestamp;

      // Re-calculate seeds per day using new current plant balance which includes
      // the newly deposited plants.
      currentSeedsPerDay =
        gardenPercentageYieldEstimate * currentPlantBalance * seedsPerPlant;
    }

    const { plantsGrown: newPlantsGrown, timestampForWholePlants } =
      getWholePlantsGrownBetween(
        seedsPerPlant,
        currentSeedsPerDay,
        optimisedStartTimestamp,
        timeWindow.endTimestamp,
        seedsAccumulated
      );

    // Make sure we can get at a whole plant today.
    if (
      newPlantsGrown > 0 &&
      timestampForWholePlants >= optimisedStartTimestamp &&
      timestampForWholePlants <= endOfDayTimestamp
    ) {
      optimisedTimeWindows.push({
        startTimestamp: optimisedStartTimestamp,
        endTimestamp: timestampForWholePlants,
      });

      if (newPlantsGrown > 0) {
        plantsGrownToday = true;
      }
      plantsGrown += newPlantsGrown;
      currentPlantBalance += newPlantsGrown;
      // Re-calculate seeds per day using new current plant balance which includes the plants grown!
      currentSeedsPerDay =
        gardenPercentageYieldEstimate * currentPlantBalance * seedsPerPlant;
      prevTimestamp = optimisedStartTimestamp;
      prevOptimisedEndTimestamp = timestampForWholePlants;

      // Reset seeds accumulated as the initial seeds accumulated have contributed to growing whole plants.
      seedsAccumulated = 0;
    } else {
      seedsAccumulated += getSeedsBetweenTimestamps(
        currentSeedsPerDay,
        optimisedStartTimestamp,
        timeWindow.endTimestamp
      );
    }
  }

  if (!plantsGrownToday) {
    return { dayActions: [], seedsAccumulated };
  }

  // When gas fees are >= 25% of plants grown then we'll skip sowing.
  // This only applies when the calculator is deciding the sow schedule,
  // when users decide the sow schedule it's in their hands to optimise
  // their schedules.
  // This is the case despite the sow frequency, there might be a case in the future
  // to make this look at each individual sow event when sowing multiple times a day.
  const plantsGrownInDripBUSDLP = plantsGrown * plantDripBUSDLPFractionForDay;
  const plantsGrownInCurrency = plantsGrownInDripBUSDLP * dripBUSDLPValueForDay;
  if (gardenAverageSowGasFee > plantsGrownInCurrency * 0.25) {
    return { dayActions: [], seedsAccumulated };
  }

  return {
    dayActions: optimisedTimeWindows.map((timeWindow) => ({
      timestamp: timeWindow.endTimestamp,
      action: "sow",
    })),
    seedsAccumulated,
  };
}

type ScheduleTimeWindow = {
  startTimestamp: number;
  endTimestamp: number;
};

function createDayScheduleTimeWindows(
  currentTimestamp: number,
  endOfDayTimestamp: number,
  sowFrequency: SowFrequency
): ScheduleTimeWindow[] {
  if (sowFrequency === "multipleTimesADay") {
    const diffInMilliseconds = endOfDayTimestamp - currentTimestamp;
    const halfDiffInMilliseconds = diffInMilliseconds / 2;
    return [
      {
        startTimestamp: currentTimestamp,
        endTimestamp: currentTimestamp + halfDiffInMilliseconds,
      },
      {
        startTimestamp: currentTimestamp + halfDiffInMilliseconds,
        endTimestamp: endOfDayTimestamp,
      },
    ];
  }
  return [
    { startTimestamp: currentTimestamp, endTimestamp: endOfDayTimestamp },
  ];
}

function depositBetweenTimestamps(
  startTimestamp: number,
  endTimestamp: number
): (deposit: DepositInSeeds) => boolean {
  return (deposit: DepositInSeeds) =>
    deposit.timestamp > startTimestamp && deposit.timestamp < endTimestamp;
}

type PlantsGrownInfo = {
  plantsGrown: number;
  timestampForWholePlants: number;
};

function getWholePlantsGrownBetween(
  seedsPerPlant: number,
  seedsPerDay: number,
  startTimestampInMilliseconds: number,
  endTimestampInMilliseconds: number,
  seedsAccumulated: number
): PlantsGrownInfo {
  const seedsForTimePeriod = getSeedsBetweenTimestamps(
    seedsPerDay,
    startTimestampInMilliseconds,
    endTimestampInMilliseconds
  );

  const totalSeeds = seedsAccumulated + seedsForTimePeriod;
  // Use floor as we deal in whole plants only and the rest of the seeds
  // will be lost for compounding and will remain in LP token balance for depositing.
  const plantsGrown = Math.floor(totalSeeds / seedsPerPlant);

  // Get the precise timestamp a plant is grown to optimise schedule!
  const secondsToGrowPlants = getSecondsToGrowNWholePlants(
    seedsPerPlant,
    seedsPerDay,
    // Seeds accumulated is seeds available at start of time window.
    seedsAccumulated,
    // Get timestamp to grow at least 1 plant even if we are not ready
    // to plant at the end of this time period.
    Math.max(plantsGrown, 1)
  );
  return {
    plantsGrown,
    timestampForWholePlants:
      // Get the next whole number of seconds as it's better to lose a few left
      // offer seeds than almost a whole plant's worth!
      startTimestampInMilliseconds + Math.ceil(secondsToGrowPlants) * 1000,
  };
}

function getSecondsToGrowNWholePlants(
  seedsPerPlant: number,
  seedsPerDay: number,
  seedsAvailable: number,
  amountOfPlants: number
): number {
  const currentPlantGrowth = seedsAvailable / seedsPerPlant;
  const nextWholeNumberOfPlants =
    Math.trunc(currentPlantGrowth) + amountOfPlants;
  const seedsNeededForWholePlants = seedsPerPlant * nextWholeNumberOfPlants;
  const remainingSeedsNeeded = seedsNeededForWholePlants - seedsAvailable;
  const seedsPerSecond = seedsPerDay / 24 / 60 / 60;
  const secondsRemaining = remainingSeedsNeeded / seedsPerSecond;
  return secondsRemaining;
}

function getSeedsBetweenTimestamps(
  seedsPerDay: number,
  startTimestampInMilliseconds: number,
  endTimestampInMilliseconds: number
): number {
  const seedsPerSecond = seedsPerDay / 24 / 60 / 60;
  const seconds =
    (endTimestampInMilliseconds - startTimestampInMilliseconds) / 1000;
  return seconds * seedsPerSecond;
}

function determineDedicatedActionForDay(
  date: Date,
  state: AppState,
  gardenReinvest: number,
  dripBUSDLPPriceForDay: number,
  // Accumulation from previous days and today up to mid-day for harvesting!
  accumSeedsToHarvestInDripBUSDLP: number,
  lastSowDate: Date,
  sowFrequency: SowFrequency
): GardenDayActionValue | "doNothing" {
  const { gardenHarvestDays } = state.settings;
  const daysInMonth = getDaysInMonth(date);
  // When days in month are not even, we'll take the extra day for harvesting!
  const numberOfHarvestDays = Math.ceil(daysInMonth * (1 - gardenReinvest));

  const currentDayInHarvestDays =
    numberOfHarvestDays > 0 &&
    ((gardenHarvestDays === "endOfMonth" &&
      date.getDate() >= daysInMonth - numberOfHarvestDays) ||
      (gardenHarvestDays === "startOfMonth" &&
        date.getDate() <= numberOfHarvestDays));

  if (currentDayInHarvestDays) {
    // Users can't provide custom harvest frequencies in their reinvestment plan,
    // only custom sow frequencies so we'll assume they'll harvest every day
    // if they can comfortably cover the gas fees with harvested rewards.
    // we'll harvest every day as long as gas fees are < 25% of
    // accumulated available seeds to harvest.
    // Users can override this behaviour completely by providing custom harvest/sow day schedules
    // in the Sow & Harvest Strategy section for a wallet.
    const accumSeedsToHarvestInCurrency =
      accumSeedsToHarvestInDripBUSDLP * dripBUSDLPPriceForDay;
    const isHarvestGasFeeLessThan25Percent =
      state.settings.gardenAverageDepositHarvestGasFee <
      accumSeedsToHarvestInCurrency * 0.25;
    return isHarvestGasFeeLessThan25Percent ? "harvest" : "doNothing";
  }

  // If we are in the sowing period and we haven't yet compounded then we
  // need start the cycle by sowing!
  if (lastSowDate.getTime() === 0) {
    return "sow";
  }

  // Make sure we are ignoring the time in the comparison purely for deciding
  // if today should be dedicated to sowing seeds.
  const lastSowDateMoment = moment(lastSowDate).startOf("day");
  const currentDateMoment = moment(date).startOf("day");
  const daysBetween = Math.floor(
    moment.duration(currentDateMoment.diff(lastSowDateMoment)).asDays()
  );

  const sowFrequencyInDays = SOW_FREQUENCY_DAYS[sowFrequency];

  const shouldWeSowToday = daysBetween % sowFrequencyInDays === 0;

  return shouldWeSowToday ? "sow" : "doNothing";
}

const SOW_FREQUENCY_DAYS: Record<SowFrequency, number> = {
  // This is purely for figuring out whether we should sow on a particular
  // day!
  multipleTimesADay: 1,
  everyDay: 1,
  everyOtherDay: 2,
  everyWeek: 7,
};

function decliningPlantLPRatioValue(
  maxPlantLPRatio: number,
  minPlantLPRatio: number,
  currentDate: Date,
  startDate: Date,
  endDate: Date
): number {
  const startDateInSeconds = Math.floor(startDate.getTime() / 1000);
  const endDateInSeconds = Math.floor(endDate.getTime() / 1000);
  // e.g. 140 - 100 = 40
  const timeScaleSeconds = endDateInSeconds - startDateInSeconds;
  const currentDateSeconds = Math.floor(currentDate.getTime() / 1000);
  if (currentDateSeconds >= endDateInSeconds) {
    return minPlantLPRatio;
  }

  if (currentDateSeconds <= startDateInSeconds) {
    return maxPlantLPRatio;
  }

  // e.g. 140 - 125 = 15
  const distanceFromEnd = endDateInSeconds - currentDateSeconds;

  // e.g. 1 - (15 / 40) = 0.625
  // Closer to the beginning we are, the higher the value.
  const fractionalPoint = 1 - distanceFromEnd / timeScaleSeconds;

  // e.g. 0.1 - 0.01 = 0.09
  const ratioScale = maxPlantLPRatio - minPlantLPRatio;

  // e.g. 0.625 * 0.09 = 0.05625
  const onRatioScale = fractionalPoint * ratioScale;

  // e.g. 0.09 - 0.05625 = 0.03375
  const ratio = maxPlantLPRatio - onRatioScale;

  return ratio;
}
