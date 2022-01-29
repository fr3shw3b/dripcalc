export type EarningsAndInfo = {
  info: OverviewInfo;
  // Mapping of wallet IDs to earnings.
  walletEarnings: Record<string, WalletEarnings>;
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
};
