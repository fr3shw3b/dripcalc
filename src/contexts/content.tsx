import { createContext } from "react";
import type { TrendPeriod } from "../services/token-value-provider";
import { HydrateFrequency, SowFrequency } from "../store/reducers/settings";

export type Content = {
  settings: SettingsContent;
  wallets: WalletsContent;
  results: ResultsContent;
  overview: OverviewContent;
  gardenOverview: GardenOverviewContent;
  dashboard: DashboardContent;
};

export type SettingsContent = {
  currencyLabel: string;
  currencyHelpText: string;
  currencies: Record<string, string>;
  dripValueTrendHelpText: string;
  dripValueTrendLabel: string;
  dripValueTrendOptions: Record<string, string>;
  uptrendMaxValueLabel: string;
  uptrendMaxValueHelpText: (currency: string) => string;
  downtrendMinValueLabel: string;
  downTrendMinValueHelpText: (currency: string) => string;
  stabilisesAtLabel: string;
  stabilisesAtHelpText: (currency: string) => string;
  averageGasFeeLabel: string;
  averageGasFeeHelpText: (currency: string) => string;
  claimDaysLabel: string;
  claimDaysHelpText: string;
  claimDays: Record<string, string>;
  trendPeriodLabel: string;
  trendPeriodHelpText: string;
  trendPeriods: Record<TrendPeriod, string>;
  defaultHydrateFrequencyHelpText: string;
  defaultHydrateFrequencyLabel: string;
  defaultHydrateFrequencies: Record<HydrateFrequency, string>;
  gardenValueTrendHelpText: string;
  gardenValueTrendLabel: string;
  gardenValueTrendOptions: Record<string, string>;
  gardenUptrendMaxValueLabel: string;
  gardenUptrendMaxValueHelpText: (currency: string) => string;
  gardenDowntrendMinValueLabel: string;
  gardenDownTrendMinValueHelpText: (currency: string) => string;
  gardenStabilisesAtLabel: string;
  gardenStabilisesAtHelpText: (currency: string) => string;
  gardenAverageGasFeeLabel: string;
  gardenAverageGasFeeHelpText: (currency: string) => string;
  gardenAverageDepositGasFeeLabel: string;
  gardenAverageDepositGasFeeHelpText: (currency: string) => string;
  gardenHarvestDaysLabel: string;
  gardenHarvestDaysHelpText: string;
  gardenHarvestDays: Record<string, string>;
  gardenTrendPeriodLabel: string;
  gardenTrendPeriodHelpText: string;
  gardenTrendPeriods: Record<TrendPeriod, string>;
  defaultGardenSowFrequencyHelpText: string;
  defaultGardenSowFrequencyLabel: string;
  defaultGardenSowFrequencies: Record<SowFrequency, string>;
  gardenLastYearLabel: string;
  gardenLastYearHelpText: string;
};

export type WalletsContent = {
  createNewWalletTitle: string;
  walletViewHelpText: React.ReactNode;
  createNewWalletButtonText: string;
  newWalletNameFieldLabel: string;
  newWalletDateFieldName: string;
  newWalletDateHelpText: string;
  depositsButtonText: string;
  reinvestButtonText: string;
  depositsAddNewText: string;
  depositsAmountInCurrencyLabel: (currency: string) => string;
  depositAmountInCurrencyHelpText: (currency: string) => string;
  depositsChangeDateText: string;
  depositsTypeLabel: string;
  depositsTypeHelpText: string;
  depositTypes: Record<string, string>;
  depositsChangeDateCollapseText: string;
  customDripValuesButtonText: string;
  monthsAddAnotherText: string;
  monthsRemoveLastMonthText: string;
  monthTableColumnLabel: string;
  yearTableColumnLabel: string;
  reinvestColumnLabel: string;
  reinvestmentPlanTableHelpText: string;
  customDripValuesColumnLabel: (currency: string) => string;
  customDripValuesTableHelpText: (currency: string) => string;
  hydrateStrategyColumnLabel: string;
  reinvestmentPlanHydrateStrategies: Record<
    "default" | HydrateFrequency,
    string
  >;
  // Garden content.
  gardenDepositsButtonText: string;
  gardenReinvestButtonText: string;
  customDripBUSDLPValuesButtonText: string;
  walletViewGardenHelpText: React.ReactNode;
  gardenDepositDateHelpText: string;
  gardenDepositAmountInCurrencyHelpText: (currency: string) => string;
  gardenReinvestmentPlanTableHelpText: React.ReactNode;
  gardenSowStrategyColumnLabel: string;
  gardenReinvestmentPlanSowStrategies: Record<"default" | SowFrequency, string>;
  customGardenValuesTableHelpText: (currency: string) => React.ReactNode;
  dripBUSDLPValueColumnLabel: (currency: string) => string;
  plantLPFractionColumnLabel: string;
  averageGardenDailyYieldColumnLabel: string;
};

export type ResultsContent = {
  earningsMonthLabel: string;
  earningsMonthHelpText: string;
  earningsMonthInCurrencyLabel: (currency: string) => string;
  earningsMonthInCurrencyHelpText: (currency: string) => string;
  reinvestMonthLabel: string;
  reinvestMonthHelpText: string;
  reinvestMonthInCurrencyLabel: (currency: string) => string;
  reinvestMonthInCurrencyHelpText: (currency: string) => string;
  monthTableColumnLabel: string;
  yearTableColumnLabel: string;
  claimMonthLabel: string;
  claimMonthHelpText: string;
  claimMonthInCurrencyLabel: (currency: string) => string;
  claimMonthInCurrencyHelpText: (currency: string) => string;
  dripDepositBalanceEndOfMonthLabel: string;
  dripDepositBalanceEndOfMonthHelpText: string;
  accumClaimedLabel: string;
  accumClaimedHelpText: string;
  accumClaimedInCurrencyLabel: (currency: string) => string;
  accumClaimedInCurrencyHelpText: (currency: string) => string;
  estimatedGasFeesMonthInCurrencyLabel: (currency: string) => string;
  estimatedGasFeesMonthInCurrencyHelpText: (currency: string) => string;
  consumedRewardsLabel: string;
  consumedRewardsHelpText: string;
  considerNewWalletText: string;
  newWalletRequiredText: string;
  // Yearly section.
  dripDepositBalanceEndOfYearHelpText: string;
  dripDepositBalanceEndOfYearLabel: string;
  yearEarningsHelpText: string;
  yearEarningsLabel: string;
  yearEarningsInCurrencyHelpText: (currency: string) => string;
  yearEarningsInCurrencyLabel: (currency: string) => string;
  yearClaimedLabel: string;
  yearClaimedHelpText: string;
  yearClaimedInCurrencyLabel: (currency: string) => string;
  yearClaimedInCurrencyHelpText: (currency: string) => string;
  // Faucet strategy section.
  dayTableColumnLabel: string;
  hydrateClaimActionColumnLabel: string;
  hydrateClaimActionColumnHelpText: string;
  hydrateClaimAccumDripRewardsLabel: string;
  hydrateClaimAccumDripRewardsHelpText: string;
  hydrateClaimClaimedOrHydratedLabel: string;
  hydrateClaimClaimedOrHydratedHelpText: string;
  hydrateClaimMaxPayoutEndOfDayLabel: string;
  hydrateClaimMaxPayoutEndOfDayHelpText: string;
  hydrateClaimConsumedRewardsEndOfDayLabel: string;
  hydrateClaimConsumedRewardsEndOfDayHelpText: string;
  // Garden monthly section.
  gardenPlantBalanceEndOfMonthLabel: string;
  gardenPlantBalanceEndOfMonthHelpText: string;
  seedsPerDayEndOfMonthHelpText: string;
  seedsPerDayEndOfMonthLabel: string;
  gardenEarningsMonthInDripBUSDLPLabel: string;
  gardenEarningsMonthInDripBUSDLPHelpText: string;
  gardenEarningsMonthInCurrencyLabel: (currency: string) => string;
  gardenEarningsMonthInCurrencyHelpText: (currency: string) => string;
  gardenReinvestMonthDripBUSDLPLabel: string;
  gardenReinvestMonthDripBUSDLPHelpText: string;
  gardenReinvestMonthInCurrencyLabel: (currency: string) => string;
  gardenReinvestMonthInCurrencyHelpText: (currency: string) => string;
  gardenClaimMonthDripBUSDLPLabel: string;
  gardenClaimMonthDripBUSDLPHelpText: string;
  gardenClaimMonthInCurrencyLabel: (currency: string) => string;
  gardenClaimMonthInCurrencyHelpText: (currency: string) => string;
  gardenLostSeedsInMonthLabel: string;
  gardenLostSeedsInMonthHelpText: string;
  gardenLostSeedsInMonthInCurrencyLabel: (currency: string) => string;
  gardenLostSeedsInMonthInCurrencyHelpText: (currency: string) => string;
  // Garden strategy section.
  gardenActionsColumnHelpText: string;
  gardenActionsColumnLabel: string;
  gardenSowOrHarvestColumnHelpText: string;
  gardenSowOrHarvestColumnLabel: string;
  gardenPlantsBalanceEndOfDayColumnHelpText: string;
  gardenPlantsBalanceEndOfDayColumnLabel: string;
  gardenSeedsPerDayEndOfDayColumnHelpText: string;
  gardenSeedsPerDayEndOfDayColumnLabel: string;
  // Garden yearly section.
  gardenPlantBalanceEndOfYearHelpText: string;
  gardenPlantBalanceEndOfYearLabel: string;
  gardenSeedsPerDayEndOfYearHelpText: string;
  gardenSeedsPerDayEndOfYearLabel: string;
  gardenYearEarningsHelpText: string;
  gardenYearEarningsLabel: string;
  gardenYearEarningsInCurrencyHelpText: (currency: string) => string;
  gardenYearEarningsInCurrencyLabel: (currency: string) => string;
  gardenYearClaimedLabel: string;
  gardenYearClaimedHelpText: string;
  gardenYearClaimedInCurrencyLabel: (currency: string) => string;
  gardenYearClaimedInCurrencyHelpText: (currency: string) => string;
  gardenYearAccumClaimedLabel: string;
  gardenYearAccumClaimedHelpText: string;
  gardenYearAccumClaimedInCurrencyLabel: (currency: string) => string;
  gardenYearAccumClaimedInCurrencyHelpText: (currency: string) => string;
};

export type OverviewContent = {
  totalRewardsConsumedPrefixText: string;
  totalRewardsConsumedHelpText: string;
  totalClaimedPrefixText: string;
  totalClaimedHelpText: string;
  totalClaimedInCurrencyHelpText: (currency: string) => string;
  netPositiveText: string;
  netPositiveHelpText: React.ReactNode;
  netPositiveValuePrefixText: string;
  maxPayoutClaimedText: string;
  maxPayoutClaimedHelpText: React.ReactNode;
  depositsOutOfPocketText: string;
  depositsOutOfPocketValuePrefixText: string;
  depositsOutOfPocketHelpText: React.ReactNode;
  depositsOutOfPocketDateHelpText: React.ReactNode;
};

export type GardenOverviewContent = {
  totalRewardsHarvestedPrefixText: string;
  totalRewardsHarvestedHelpText: (currency: string) => string;
  totalPlantsPrefixText: string;
  totalPlantsHelpText: string;
};

export type DashboardContent = {
  faucetDayEarningsInCurrencyHelpText: (
    currency: string,
    dripValueInCurrency: string
  ) => string;
};

export function content(): Content {
  return {
    settings: {
      currencyLabel: "Currency",
      currencyHelpText:
        "Select the FIAT currency to be used to convert tokens to across the calculators. (This is shared between all calculators)",
      currencies: {
        "£": "GBP (£)",
        $: "USD ($)",
        "€": "EUR (€)",
      },
      dripValueTrendLabel: "DRIP Value Trend",
      dripValueTrendHelpText:
        "The trend of the DRIP token value from the moment you open your first wallet " +
        " to the moment all rewards have been consumed in your last wallet. " +
        "When you input custom DRIP values for a wallet, the trend will begin from the date of the last custom DRIP value you enter.",
      dripValueTrendOptions: {
        downtrend: "Bearish",
        stable: "Stable",
        uptrend: "Bullish",
      },
      uptrendMaxValueLabel: "Bullish Max Value",
      uptrendMaxValueHelpText: (currency: string) =>
        `The maximum value the DRIP token will reach in ${currency}`,
      downtrendMinValueLabel: "Bearish Min Value",
      downTrendMinValueHelpText: (currency: string) =>
        `The minimum value the DRIP token will fall to in ${currency}`,
      stabilisesAtLabel: "Stabilises At Value",
      stabilisesAtHelpText: (currency: string) =>
        `The value the DRIP token will stabilise at in ${currency}`,
      averageGasFeeLabel: "Average Gas Fee",
      averageGasFeeHelpText: (currency: string) =>
        `The average cost of gas per hydrate in ${currency}. Hydrating (recompounding) is the automated process of claim and deposit.`,
      claimDaysLabel: "Claim Days",
      claimDaysHelpText:
        "The time of the month you will claim the percentage of your rewards that is not reinvested each month.",
      claimDays: {
        startOfMonth: "Start of Month",
        endOfMonth: "End of Month",
      },
      trendPeriodLabel: "Trend Period",
      trendPeriodHelpText:
        "The amount of years the DRIP value trend period is spread across. After this time period the value will remain the same as the target value unless you provide custom DRIP values in each wallet." +
        " The target value is the maximum value for up trend, minimum value for down trend and stabilises at for stable trend.",
      trendPeriods: {
        oneYear: "One Year",
        twoYears: "Two Years",
        fiveYears: "Five Years",
        tenYears: "Ten Years",
      },
      defaultHydrateFrequencyHelpText:
        "The default frequency at which to hydrate (re-invest or compound), this is overridden if you provide fine-grained monthly hydrate/claim data in your reinvestment plan. " +
        '"Automatic" means the calculator will determine an optimised strategy making sure the gas fee is less than 25% of the amount of DRIP being compounded, even in automatic mode the minimum hydrate frequency is 1 day.',
      defaultHydrateFrequencyLabel: "Default Hydrate Frequency",
      defaultHydrateFrequencies: {
        everyDay: "Every Day",
        everyOtherDay: "Every Other Day",
        everyWeek: "Every Week",
        automatic: "Automatic",
      },
      gardenValueTrendLabel: "DRIP/BUSD LP Value Trend",
      gardenValueTrendHelpText:
        "The trend of the DRIP/BUSD LP token value from the moment you open your first wallet " +
        " to the end of the last year configured in the garden settings. " +
        "When you input custom DRIP/BUSD LP values for a wallet, the trend will begin from the date of the last custom DRIP/BUSD LP value you enter.",
      gardenValueTrendOptions: {
        downtrend: "Bearish",
        stable: "Stable",
        uptrend: "Bullish",
      },
      gardenUptrendMaxValueLabel: "Bullish Max Value",
      gardenUptrendMaxValueHelpText: (currency: string) =>
        `The maximum value the DRIP/BUSD LP token will reach in ${currency}`,
      gardenDowntrendMinValueLabel: "Bearish Min Value",
      gardenDownTrendMinValueHelpText: (currency: string) =>
        `The minimum value the DRIP/BUSD LP token will fall to in ${currency}. Think about the potential size of the liquidity pool, the number of LPs with a share of the pool and the amount of LPs withdrawing liquidity when adding this value.`,
      gardenStabilisesAtLabel: "Stabilises At Value",
      gardenStabilisesAtHelpText: (currency: string) =>
        `The value the DRIP/BUSD LP token will stabilise at in ${currency}`,
      gardenAverageGasFeeLabel: "Average Sow Gas Fee",
      gardenAverageGasFeeHelpText: (currency: string) =>
        `The average cost of gas per compound (sowing seeds) in ${currency}.`,
      gardenAverageDepositGasFeeLabel: "Average Deposit or Harvest Gas Fee",
      gardenAverageDepositGasFeeHelpText: (currency: string) =>
        `The average cost of gas per deposit (buying plants)  or claim (harvesting seeds) in ${currency}. This is generally a lot higher than compounding.`,
      gardenHarvestDaysLabel: "Harvest Days",
      gardenHarvestDaysHelpText:
        "The time of the month you will claim the percentage of your rewards that is not reinvested each month.",
      gardenHarvestDays: {
        startOfMonth: "Start of Month",
        endOfMonth: "End of Month",
      },
      gardenTrendPeriodLabel: "Trend Period",
      gardenTrendPeriodHelpText:
        "The amount of years the DRIP/BUSD LP token value trend period is spread across. After this time period the value will remain the same as the target value unless you provide custom DRIP/BUSD LP token values in each wallet." +
        " The target value is the maximum value for up trend, minimum value for down trend and stabilises at for stable trend.",
      gardenTrendPeriods: {
        oneYear: "One Year",
        twoYears: "Two Years",
        fiveYears: "Five Years",
        tenYears: "Ten Years",
      },
      defaultGardenSowFrequencyHelpText:
        "The default frequency at which to sow seeds (re-invest or compound), this is overridden if you provide fine-grained monthly hydrate/claim data in your reinvestment plan.",
      defaultGardenSowFrequencyLabel: "Default Sow Frequency",
      defaultGardenSowFrequencies: {
        multipleTimesADay: "Multiple Times A Day",
        everyDay: "Every Day",
        everyOtherDay: "Every Other Day",
        everyWeek: "Every Week",
      },
      gardenLastYearLabel: "Last Year in Garden",
      gardenLastYearHelpText:
        'The last year in the garden to calculate earnings for, unlike the faucet, the garden does not have a max payout of rewards so wallets don\'t have calculated "expiry" dates.',
    },
    wallets: {
      createNewWalletTitle: "Create New Wallet",
      walletViewHelpText: (
        <>
          <h3>Overview</h3>
          <p>
            This is a view where you can manage your DRIP faucet strategy across
            wallets over a period of time. You can configure one off or monthly
            deposits, devise a reinvestment plan for a series of months and fill
            in custom DRIP values for months.
          </p>
          <p>
            As time goes on you will most likely want to fill in custom DRIP
            values for each month that passes.
          </p>
          <p>
            Depending on your reinvestment (hydrate vs claim) strategy, amount
            and frequencey of deposits and the DRIP trend you configured in
            settings the end year of each wallet will change dynamically. The
            end year is the first year in which you will no longer earn the 1%
            daily rewards from the faucet.
          </p>
          <h3>Tables</h3>
          <p>
            To find out more information about each column in the tables, you
            can hover over the column headings that will reveal tooltips with
            more information.
          </p>
          <p>
            In the monthly view, rows will turn amber if you should consider a
            new wallet and red when you are getting close to reaching the max
            payout with your consumed rewards balance.
          </p>
        </>
      ),
      createNewWalletButtonText: "new wallet",
      newWalletNameFieldLabel: "Name",
      newWalletDateFieldName: "Start Date",
      newWalletDateHelpText:
        "The date on which the new wallet starts, this is the month you make your first deposit in the new wallet.",
      depositsButtonText: "deposits",
      reinvestButtonText: "reinvestment plan",
      depositsAddNewText: "new deposit",
      depositsAmountInCurrencyLabel: (currency: string) =>
        `Deposit amount in ${currency}`,
      depositAmountInCurrencyHelpText: (currency: string) =>
        `The amount of the deposit in ${currency}, fees and the DRIP deposit tax will be subtracted before the deposit is added to the faucet deposit balance.`,
      depositsChangeDateText: "change date",
      depositsChangeDateCollapseText: "hide date picker",
      depositsTypeLabel: "Choose deposit type",
      depositsTypeHelpText:
        "You can either choose a monthly deposit up to a specified date or an isolated one-off deposit",
      depositTypes: {
        monthly: "Monthly deposits",
        oneOff: "One off deposit",
      },
      customDripValuesButtonText: "custom drip values",
      monthsAddAnotherText: "add another month",
      monthsRemoveLastMonthText: "remove last month",
      monthTableColumnLabel: "Month",
      yearTableColumnLabel: "Year",
      reinvestColumnLabel: "Reinvest %",
      hydrateStrategyColumnLabel: "Hydrate Frequency",
      reinvestmentPlanHydrateStrategies: {
        default: "Use Plan Settings",
        everyDay: "Every Day",
        everyOtherDay: "Every Other Day",
        everyWeek: "Every Week",
        automatic: "Automatic",
      },
      reinvestmentPlanTableHelpText:
        'Edit the "Reinvest %" column for each month and then save your changes. You can add more months if you need to.',
      customDripValuesColumnLabel: (currency: string) =>
        `DRIP Value ${currency}`,
      customDripValuesTableHelpText: (currency: string) =>
        `Edit the "DRIP Value ${currency}" column for each month and then save your changes. You can add more months if you need to.`,
      gardenDepositsButtonText: "deposits (buy plants)",
      customDripBUSDLPValuesButtonText: "custom drip/busd lp values",
      gardenReinvestButtonText: "reinvest (sow seeds)",
      walletViewGardenHelpText: (
        <>
          {" "}
          <h3>Overview</h3>
          <p>
            This is a view where you can manage your DRIP/BUSD LP garden
            strategy across over a significant period of time. You can configure
            one off or monthly deposits (buying plants), devise a reinvestment
            plan for a series of months and fill in custom DRIP/BUSD LP values
            for months.
          </p>
          <p>
            For custom DRIP/BUSD LP values, you can provide a value representing
            the current fiat currency value for the the LP token. This is an
            estimate that should be based on the formula used in the liquidity
            provider contract relative to the total in the DRIP and BUSD
            reserves in the liquidity pool.
          </p>
          <p>
            You also need to specify the fraction of an LP token a plant
            (2592000 seeds) is worth, this fluctuates based on the activity of
            all the players in the DRIP garden. As time goes on you will most
            likely want to fill in custom DRIP/BUSD LP and plant fraction values
            for each month that passes.
          </p>
          <p>
            The last of the values you can provide via the "custom drip/busd lp
            values" modal is the average garden daily yield percentage for the
            month. This fluctuates based on the activity of the whole community
            of gardeners and can be up to 3%.
          </p>
          <h3>Tables</h3>
          <p>
            To find out more information about each column in the tables, you
            can hover over the column headings that will reveal tooltips with
            more information.
          </p>
        </>
      ),
      gardenDepositAmountInCurrencyHelpText: (currency: string) =>
        `The amount of the deposit (plants bought) in ${currency}, fees will be subtracted before the deposit is added to your plants balance.` +
        ` You can only buy whole plants so any left over will be left in your DRIP/BUSD LP Token balance.`,
      gardenReinvestmentPlanTableHelpText: (
        <>
          <p>
            Edit the "Reinvest %" column for each month and then save your
            changes. You can add more months if you need to.
          </p>
          <p>
            The "Reinvest %" column represents the percentage in which you will
            sow seeds to grow plants (compound rewards) instead of harvesting
            them (withdrawing).
          </p>
          <p>
            The percentage provided here will not be 100% accurate as you can
            only compound in whole plants."
          </p>
        </>
      ),
      gardenSowStrategyColumnLabel: "Sow Frequency",
      gardenReinvestmentPlanSowStrategies: {
        default: "Use Plan Settings",
        multipleTimesADay: "Multiple Times A Day",
        everyDay: "Every Day",
        everyOtherDay: "Every Other Day",
        everyWeek: "Every Week",
      },
      gardenDepositDateHelpText:
        "The deposit date down to the second is really important for the garden in order to accurately calculate earnings based on seeds available from the moment the plants are bought!",
      customGardenValuesTableHelpText: (currency: string) => (
        <>
          <p>
            Edit the "DRIP/BUSD LP Value {currency}", "Plant LP Token %" and
            "Average Garden Daily Yield %" columns for each month and then save
            your changes. You can add more months if you need to.
          </p>
          <h3>DRIP/BUSD LP Value {currency}</h3>
          <p>
            "DRIP/BUSD LP Value {currency}" is the value of the DRIP/BUSD LP
            Token for the month, the value of this would be derived from the
            DRIP and BUSD reserves in the liquidity pool.
          </p>
          <h3>Plant LP Token %</h3>
          <p>
            "Plant LP Token %" is the percentage of the LP token that a plant is
            worth where a plant is 2,592,000 seeds in the garden. The garden
            contract uses time and contract balance multipliers to give fair
            share to all players over time incentivising new capital. What this
            means is over time the "Plant LP Token %" reduces so factor this in
            when providing custom values!
          </p>
          <strong>Inflation</strong>
          <p>
            If the contract balance of the garden in DRIP/BUSD LP does not
            increase, the value of plants will drop as every plant compounded
            will be worth less DRIP/BUSD LP. The number of plants in existence
            are always increasing; plants are a representation of a percentage
            of a DRIP/BUSD LP token.
          </p>
          <h3>Average Garden Daily Yield %</h3>
          <p>
            "Average Garden Daily Yield %" is the daily yield that can be up to
            3% but fluctuates based on the activity of the wider community of
            gardeners and your personal habits. This value can also be seen as
            the daily seed rate that can be produced that reduces when you
            harvest more than you compound.
          </p>
        </>
      ),
      dripBUSDLPValueColumnLabel: (currency: string) =>
        `DRIP/BUSD LP Value ${currency}`,
      plantLPFractionColumnLabel: "Plant LP Token %",
      averageGardenDailyYieldColumnLabel: "Average Garden Daily Yield %",
    },
    results: {
      earningsMonthLabel: "Earnings (DRIP)",
      earningsMonthHelpText:
        "The total earnings in DRIP for the month from your 1% daily rewards, this is before deciding whether to hydrate or claim each day.",
      earningsMonthInCurrencyLabel: (currency: string) =>
        `Earnings ${currency} (Est.)`,
      earningsMonthInCurrencyHelpText: (currency: string) =>
        `The total estimated earnings in ${currency} for the month from your 1% daily rewards. This is based on the value of DRIP in ${currency} each day. This is before deciding whether to hydrate or claim each day.`,
      reinvestMonthLabel: "Reinvest (DRIP)",
      reinvestMonthHelpText:
        "The total re-invested in DRIP after the 5% compound (hydrate) tax",
      reinvestMonthInCurrencyLabel: (currency: string) =>
        `Reinvest ${currency} (Est.)`,
      reinvestMonthInCurrencyHelpText: (currency: string) =>
        `The total estimated in ${currency} for the month that is reinvested into your faucet deposit balance. This is based on the value of DRIP in ${currency} each day.`,
      monthTableColumnLabel: "Month",
      yearTableColumnLabel: "Year",
      claimMonthLabel: "Claimed (DRIP)",
      claimMonthHelpText:
        "The total claimed to your own wallet in DRIP after the 10% claim tax for the month",
      claimMonthInCurrencyLabel: (currency: string) =>
        `Claimed ${currency} (Est.)`,
      claimMonthInCurrencyHelpText: (currency: string) =>
        `The total estimated in ${currency} for the month claimed out into your own wallet. This is based on the value of DRIP in ${currency} each day.`,
      dripDepositBalanceEndOfMonthLabel: "DRIP Faucet Deposit Balance EOM",
      dripDepositBalanceEndOfMonthHelpText:
        "The DRIP Faucet Deposit Balance at the end of the month that your 1% daily rewards are based on",
      accumClaimedLabel: "Accum. Claimed (DRIP)",
      accumClaimedHelpText:
        "The accumulation of rewards claimed to the wallet across months and years.",
      accumClaimedInCurrencyLabel: (currency: string) =>
        `Accum. Claimed ${currency} (Est.)`,
      accumClaimedInCurrencyHelpText: (currency: string) =>
        `The total estimated in ${currency} for the wallet claimed out into your own wallet. This is based on the value of DRIP in ${currency} each day.`,
      estimatedGasFeesMonthInCurrencyLabel: (currency: string) =>
        `Gas Fees ${currency} (Est.)`,
      estimatedGasFeesMonthInCurrencyHelpText: (currency: string) =>
        `The total estimated in ${currency} for the cost in gas fees for the month. This is based on what you have set as the average gas fee in ${currency} in settings.`,
      consumedRewardsLabel: "Consumed Rewards (DRIP)",
      consumedRewardsHelpText:
        "The accumulation of consumed rewards for the wallet where consumed rewards includes both " +
        "claimed and reinvested rewards! Once this reaches max payout you will no longer receive rewards in this wallet.",
      considerNewWalletText: "Consider opening and depositing to a new wallet",
      newWalletRequiredText:
        "A new wallet is required to keep earning rewards in the long term",
      dripDepositBalanceEndOfYearLabel: "DRIP Faucet Deposit Balance EOY",
      dripDepositBalanceEndOfYearHelpText:
        "The DRIP Faucet Deposit Balance at the end of the year that your 1% daily rewards are based on",
      yearEarningsLabel: "Earnings (DRIP)",
      yearEarningsHelpText:
        "The total earnings in DRIP for the year from your 1% daily rewards, this is before deciding whether to hydrate or claim each day.",
      yearEarningsInCurrencyLabel: (currency: string) =>
        `Earnings ${currency} (Est.)`,
      yearEarningsInCurrencyHelpText: (currency: string) =>
        `The total estimated earnings in ${currency} for the year from your 1% daily rewards. This is based on the value of DRIP in ${currency} each day. This is before deciding whether to hydrate or claim each day.`,
      yearClaimedLabel: "Claimed (DRIP)",
      yearClaimedHelpText:
        "The total claimed to your own wallet in DRIP after the 10% claim tax",
      yearClaimedInCurrencyLabel: (currency: string) =>
        `Claimed ${currency} (Est.)`,
      yearClaimedInCurrencyHelpText: (currency: string) =>
        `The total estimated in ${currency} for the year claimed out into your own wallet. This is based on the value of DRIP in ${currency} each day.`,
      dayTableColumnLabel: "Day",
      hydrateClaimActionColumnLabel: "Action",
      hydrateClaimActionColumnHelpText:
        "The action to carry out on this day, either hydrate, claim or leave available rewards to accumulate.",
      hydrateClaimAccumDripRewardsLabel: "Accum. DRIP Rewards",
      hydrateClaimAccumDripRewardsHelpText:
        'The estimated DRIP rewards accumulating in the "Available" column in the faucet prior to claiming or hydrating.',
      hydrateClaimClaimedOrHydratedLabel: "Claimed or Hydrated (DRIP)",
      hydrateClaimClaimedOrHydratedHelpText:
        "The estimated amount of DRIP claimed or hydrated after tax on a given day",
      hydrateClaimMaxPayoutEndOfDayLabel: "Max Payout EOD (DRIP)",
      hydrateClaimMaxPayoutEndOfDayHelpText:
        "The max payout at the end of the day in DRIP based on the DRIP deposit balance at the end of day." +
        " This value is used in the automatic hydrate/claim strategy to ensure you do not reach max payout too early.",
      hydrateClaimConsumedRewardsEndOfDayLabel: "Consumed Rewards EOD (DRIP)",
      hydrateClaimConsumedRewardsEndOfDayHelpText:
        "The total accumulated consumed rewards in DRIP at the end of the day. If consumed rewards + available " +
        "rewards is within 10% of the current max payout then you will need to claim so your rewards do not stop.",
      gardenPlantBalanceEndOfMonthLabel: "Plant Balance EOM",
      gardenPlantBalanceEndOfMonthHelpText:
        "The Plant Deposit Balance at the end of the month that your daily rewards in seeds are based on. This balance increases when you sow seeds (compound).",
      seedsPerDayEndOfMonthLabel: "Seeds Per Day EOM",
      seedsPerDayEndOfMonthHelpText:
        "The amount of seeds you can receive a day by the end of the month. This balance increases when you sow seeds (compound).",
      gardenEarningsMonthInDripBUSDLPLabel: "Earnings (DRIP/BUSD LP)",
      gardenEarningsMonthInDripBUSDLPHelpText:
        "The amount of earnings in daily rewards (seeds) over the course of a month, this is before deciding whether to sow (compound) or harvest (withdraw) seeds each day.",
      gardenEarningsMonthInCurrencyLabel: (currency: string) =>
        `Earnings ${currency} (Est.)`,
      gardenEarningsMonthInCurrencyHelpText: (currency: string) =>
        `The total estimated earnings in ${currency} for the month from your daily rewards (seeds). This is based on the value of the DRIP/BUSD LP token in ${currency} and the fraction of DRIP/BUSD LP a plant is worth each day. This is before deciding whether to sow (compound) or harvest (withdraw) seeds each day.`,
      gardenReinvestMonthDripBUSDLPLabel: "Reinvest (DRIP/BUSD LP)",
      gardenReinvestMonthDripBUSDLPHelpText:
        "The total reinvested to sow seeds and grow plants to increase the seeds per day and therefore the plant balance which increases the daily rewards",
      gardenReinvestMonthInCurrencyLabel: (currency: string) =>
        `Reinvest ${currency} (Est.)`,
      gardenReinvestMonthInCurrencyHelpText: (currency: string) =>
        `The total estimated in ${currency} for the month that is reinvested into your plants balance by sowing seeds. This is based on the value of DRIP/BUSD LP in ${currency} each day.`,
      gardenClaimMonthDripBUSDLPLabel: "Claimed (DRIP/BUSD LP)",
      gardenClaimMonthDripBUSDLPHelpText:
        "The total claimed in DRIP/BUSD LP (Harvested seeds) for the month.",
      gardenClaimMonthInCurrencyLabel: (currency: string) =>
        `Claimed ${currency} (Est.)`,
      gardenClaimMonthInCurrencyHelpText: (currency: string) =>
        `The total estimated in ${currency} for the month that has been withdrawn from the garden by harvesting seeds. This is based on the value of DRIP/BUSD LP token in ${currency} and the fraction of DRIP/BUSD LP a plant is worth each day.`,
      gardenLostSeedsInMonthLabel: "Seeds Lost For Month",
      gardenLostSeedsInMonthHelpText:
        "The amount of seeds lost for the month due to inefficiencies in your compound schedule. When compounding your rewards, you will want to sow your seeds as close to the time when you have enough seeds for a whole plant as possible.",
      gardenLostSeedsInMonthInCurrencyLabel: (currency: string) =>
        `Seeds Lost For Month ${currency} (Est.)`,
      gardenLostSeedsInMonthInCurrencyHelpText: (currency: string) =>
        `The estimated amount of seeds lost for the month in ${currency} due to inefficiencies in your compound schedule. When compounding your rewards, you will want to sow your seeds as close to the time when you have enough seeds for a whole plant as possible.` +
        ` The value in ${currency} is based on the value of DRIP/BUSD LP tokens on the day seeds were lost.`,
      gardenActionsColumnHelpText:
        "The actions to carry out on this day, either sow, harvest or leave available seeds to accumulate.",
      gardenActionsColumnLabel: "Actions",
      gardenSowOrHarvestColumnLabel: "Harv. or Comp. (DRIP/BUSD LP)",
      gardenSowOrHarvestColumnHelpText:
        "The estimated amount of DRIP/BUSD LP harvested or compounded on a given day",
      gardenPlantsBalanceEndOfDayColumnLabel: "Plants Balance EOD",
      gardenPlantsBalanceEndOfDayColumnHelpText:
        "Your plants balance at the end of a given day",
      gardenSeedsPerDayEndOfDayColumnLabel: "Seeds per Day EOD",
      gardenSeedsPerDayEndOfDayColumnHelpText:
        "The rate at which your plants will produce seeds at the end of a given day",
      gardenPlantBalanceEndOfYearLabel: "Plant Balance EOY",
      gardenPlantBalanceEndOfYearHelpText:
        "Your balance of plants producing seeds every day by the end of the year",
      gardenSeedsPerDayEndOfYearLabel: "Seeds per Day EOY",
      gardenSeedsPerDayEndOfYearHelpText:
        "The rate at which your plants will produce seeds by the end of the year",
      gardenYearEarningsLabel: "Earnings DRIP/BUSD LP (Est.)",
      gardenYearEarningsHelpText:
        "The estimated earnings in DRIP/BUSD LP for the year. This is before claiming or compounding.",
      gardenYearEarningsInCurrencyLabel: (currency: string) =>
        `Earnings ${currency} (Est.)`,
      gardenYearEarningsInCurrencyHelpText: (currency: string) =>
        `The estimated earnings in ${currency} for the year. This is before claiming or compounding.`,
      gardenYearClaimedLabel: "Claimed DRIP/BUSD LP (Est.)",
      gardenYearClaimedHelpText:
        "The estimated claimed earnings (harvested seeds) in DRIP/BUSD LP for the year",
      gardenYearClaimedInCurrencyLabel: (currency: string) =>
        `Claimed ${currency} (Est.)`,
      gardenYearClaimedInCurrencyHelpText: (currency: string) =>
        `The estimated claimed earnings (harvested seeds) in ${currency} for the year`,
      gardenYearAccumClaimedLabel: "Accum Claimed DRIP/BUSD LP (Est.)",
      gardenYearAccumClaimedHelpText:
        "The estimated accumulation of claimed earnings over years in DRIP/BUSD LP",
      gardenYearAccumClaimedInCurrencyLabel: (currency: string) =>
        `Accum Claimed ${currency} (Est.)`,
      gardenYearAccumClaimedInCurrencyHelpText: (currency: string) =>
        `The estimated accumulation of claimed earnings over years in ${currency}`,
    },
    overview: {
      totalRewardsConsumedPrefixText: "Total Rewards Consumed by ",
      totalRewardsConsumedHelpText:
        "The total rewards consumed (hydrated and claimed) across all wallets. " +
        "The date specified here is the last month and year for which rewards are received in all wallets.",
      totalClaimedPrefixText: "Total Claimed by ",
      totalClaimedHelpText:
        "The total claimed out to your wallets from the 1% daily rewards.",
      totalClaimedInCurrencyHelpText: (currency: string) =>
        `The total estimated in ${currency} claimed across all wallets. This is based on the value of DRIP in ${currency} each day.`,
      netPositiveText: "Net Positive",
      netPositiveHelpText: (
        <p>
          The net positive value is a positive net deposit balance. You are only
          eligible for rewards from your downlines if you are net positive. Net
          deposit value is{" "}
          <strong>
            <i>(depositBalance + rolls + airdrops) - claims</i>
          </strong>
          , dripcalc however does not take airdrops into account so this is only
          an estimate based on{" "}
          <strong>
            <i>(depositBalance + rolls) - claims</i>
          </strong>
          .
        </p>
      ),
      netPositiveValuePrefixText: "Up to ",
      maxPayoutClaimedText: "% Max Payout Claimed",
      maxPayoutClaimedHelpText: (
        <>
          <p>
            The percentage of the total max payout/consumed rewards across
            wallets that you claimed out instead of reinvesting (hydrating).
          </p>
          <p>
            You will most likely want to form a strategy that balances hydrating
            and claiming to make sure you can claim out a decent proportion of
            profits before reaching the max payout limit for each wallet.
          </p>
        </>
      ),
      depositsOutOfPocketText: "Deposits out of Pocket",
      depositsOutOfPocketValuePrefixText: "Covered by ",
      depositsOutOfPocketHelpText: (
        <>
          <p>
            The combination of the total amount of deposits and estimated gas
            fees that you need to cover out of your own pocket. After building
            up the first wallet it's up to you whether you deposit into other
            wallets from your own pocket or from the first wallet.
          </p>
          <p>
            Deposits out of your pocket will be less than the estimates here if
            you use a previous wallet to fund others and don't consider using
            earnings from DRIP to be "out of your pocket".
          </p>
        </>
      ),
      depositsOutOfPocketDateHelpText: (
        <>
          <p>
            The date by which your claimed DRIP earnings will have covered your
            total deposits across all your wallets up to the end date of the
            last wallet.
          </p>
          <p>
            For example if your deposits and gas fees for all wallets from
            January 2022 to December 2030 come to £20,000 and your covered by
            date is March 2024, this means all your past and future deposits up
            to December 2030 have been covered by the profits you have claimed
            from DRIP out to your wallets by March 2024.
          </p>
          <p>
            This will have a value of{" "}
            <strong>
              <i>Not Covered</i>
            </strong>{" "}
            if your claims never cover the cost of deposits and gas fees.
          </p>
        </>
      ),
    },
    gardenOverview: {
      totalRewardsHarvestedPrefixText: "Total Harvested Rewards up to ",
      totalRewardsHarvestedHelpText: (currency: string) =>
        "The total rewards harvested (withdrawn) up to the final year configured in the current plan's garden settings. " +
        `These rewards are shown in DRIP/BUSD LP and ${currency} and not in plants as harvested rewards (seeds) are in DRIP/BUSD LP.`,
      totalPlantsPrefixText: "Total Plants by ",
      totalPlantsHelpText:
        "The total amount of plants you will have yielding rewards in your garden by the final year configured in the current plan's garden settings.",
    },
    dashboard: {
      faucetDayEarningsInCurrencyHelpText: (
        currency: string,
        dripValueInCurrency: string
      ) =>
        `The total estimated rewards in ${currency} for today across all wallets in the selected plan.` +
        ` This is based on the value of DRIP in ${currency} being ${dripValueInCurrency} today.`,
    },
  };
}

export default createContext(content());
