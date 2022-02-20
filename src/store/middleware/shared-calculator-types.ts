// An augmented version of AppState that is adapted to be compatible
// with existing calculator functionality implemented before the introduction
// of plans when you could only have one "plan" with wallets and settings

import type { GardenDayAction, WalletState } from "../reducers/plans";
import type { PlanSettings } from "../reducers/settings";

// as top-level state.
export type AppState = {
  wallets: {
    wallets: WalletState[];
  };
  settings: PlanSettings;
  prevCalculatedEarnings?: EarningsAndInfo;
};

export type EarningsAndInfo = {
  info: OverviewInfo;
  // Mapping of wallet IDs to earnings.
  walletEarnings: Record<string, WalletEarnings>;
  gardenEarnings: GardenEarnings;
};

export type OverviewInfo = {
  totalClaimed: number;
  totalClaimedInCurrency: number;
  // Timestamp in milliseconds.
  lastPayoutMonth: number;
  // Timestamp in milliseconds.
  netPositiveUpToDate: number;
  // Real number between 0 and 1.
  // claimed or hydrated!
  percentageMaxPayoutConsumed: number;
  depositsOutOfPocket: number;
  // Timestamp in milliseconds.
  depositsOutOfPocketCoveredBy: number;
  totalConsumedRewards: number;
};

export type WalletEarnings = {
  yearEarnings: Record<number, YearEarnings>;
};

export type YearEarnings = {
  year: number;
  monthEarnings: Record<number, MonthEarningsAndInfo>;
  totalYearClaimedAfterTax: number;
  totalYearClaimedInCurrency: number;
  totalYearEarnings: number;
  totalYearEarningsInCurrency: number;
  lastYear: boolean;
};

export type NextActions =
  | "keepCompounding"
  | "considerNewWallet"
  | "newWalletRequired";

export type MonthEarningsAndInfo = {
  // Timestamp in milliseconds.
  month: number;
  monthEarnings: number;
  monthReinvestedAfterTax: number;
  monthReinvestedInCurrency: number;
  monthClaimedAfterTax: number;
  monthClaimedInCurrency: number;
  dayEarnings: Record<number, DayEarnings>;
  dripDepositBalanceEndOfMonth: number;
  monthEarningsInCurrency: number;
  accumClaimed: number;
  accumClaimedInCurrency: number;
  accumConsumedRewards: number;
  monthEstimatedGasFees: number;
  monthEstimatedGasFeesOutOfPocket: number;
  dripValueForMonth: number;
  nextActions: NextActions;
};

export type DayEarnings = {
  earnings: number;
  earningsInCurrency: number;
  reinvestAfterTax: number;
  reinvestInCurrency: number;
  claimAfterTax: number;
  claimInCurrency: number;
  dripValueOnDay: number;
  dripDepositBalance: number;
  estimatedGasFees: number;
  accumConsumedRewards: number;
  // The accumulated daily rewards from previous days
  // that have not yet been hydrated or claimed!
  accumDailyRewards: number;
  // daily claimed rewards >= 2 . gas fees for day?
  estimatedGasFeesCoveredByClaimedRewards: boolean;
  isClaimDay: boolean;
  leaveRewardsToAccumulateForClaim: boolean;
  isHydrateDay: boolean;
  leaveRewardsToAccumulateForHydrate: boolean;
  lastHydrateTimestamp: number;
  lastClaimTimestamp: number;
};

export type GardenEarnings = {
  info: GardenOverviewInfo;
  // Mapping of wallet IDs to garden earnings.
  walletEarnings: Record<string, WalletGardenEarnings>;
};

export type GardenOverviewInfo = {
  totalHarvestedRewardsInDripBUSDLP: number;
  totalHarvestedRewardsInCurrency: number;
  totalPlantsBalanceByEnd: number;
};

export type WalletGardenEarnings = {
  yearEarnings: Record<number, GardenYearEarnings>;
};

export type GardenYearEarnings = {
  year: number;
  monthEarnings: Record<number, GardenMonthEarningsAndInfo>;
  totalYearHarvestedInDripBUSDLP: number;
  totalYearHarvestedInCurrency: number;
  accumYearHarvestedInDripBUSDLP: number;
  accumYearHarvestedInCurrency: number;
  seedsPerDayEndOfYear: number;
  seedsLostForYear: number;
  seedsLostForYearInCurrency: number;
  plantBalanceEndOfYear: number;
  totalYearEarningsInDripBUSDLP: number;
  totalYearEarningsInCurrency: number;
};

export type GardenMonthEarningsAndInfo = {
  // Timestamp in milliseconds.
  month: number;
  plantBalanceEndOfMonth: number;
  seedsPerDayEndOfMonth: number;
  monthEarningsInDripBUSDLP: number;
  monthEarningsInCurrency: number;
  monthReinvestedInDripBUSDLP: number;
  monthReinvestedInCurrency: number;
  monthClaimedInDripBUSDLP: number;
  monthClaimedInCurrency: number;
  dayEarnings: Record<number, GardenDayEarnings>;
  seedsLostForMonth: number;
  seedsLostForMonthInCurrency: number;
  monthEstimatedGasFees: number;
  dripBUSDLPValueForMonth: number;
  plantDripBUSDLPFractionForMonth: number;
};

export type GardenDayEarnings = {
  earningsInDripBUSDLP: number;
  earningsInCurrency: number;
  reinvestInDripBUSDLP: number;
  reinvestInCurrency: number;
  claimInDripBUSDLP: number;
  claimInCurrency: number;
  dripBUSDLPValueOnDay: number;
  plantDripBUSDLPFractionOnDay: number;
  plantsBalance: number;
  estimatedGasFees: number;
  seedsLost: number;
  seedsLostInCurrency: number;
  plantsGrown: number;
  seedsPerDay: number;
  // INTERNAL USE ONLY - this is used to keep track of the seeds accumulated
  // when forming schedules to prevent circular dependencies between behaviour to calculate
  // earnings from schedules and behaviour to create schedules!
  seedsAccumulatedFromPreviousDaySchedules: number;
  // The accumulated daily rewards from previous days
  // that have not yet been compounded or claimed!
  // This is in raw seeds!
  accumSeedsToHarvestOrSow: number;
  // Accum seeds in DRIP/BUSD LP tokens for the day.
  // If the value changes day to day while accumulating
  // then the value of the accumulated seeds from previous days
  // will also change!
  accumSeedsToHarvestOrSowInDripBUSDLP: number;
  // A single day can be both a harvest and sow day!
  isHarvestDay: boolean;
  // A single day can be both a harvest and sow day!
  isSowDay: boolean;
  // Sow/harvest schedule for the day, this is an array to allow for
  // a sow schedule for multiple times a day.
  sowHarvestSchedule: GardenDayAction[];
  // Sow/harvest schedule for other days that have been captured
  // due to optimisations made on the fly.
  sowHarvestScheduleSpillOver: GardenDayAction[];
  leaveRewardsToAccumulate: boolean;
  lastSowTimestamp: number;
  lastHarvestTimestamp: number;
  // Stored for convenience to be checked the next day.
  lastDepositTimestamp: number;
};
