import { createContext } from "react";

export type Content = {
  settings: SettingsContent;
  wallets: WalletsContent;
  results: ResultsContent;
  overview: OverviewContent;
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
  monthTableColumnLabel: string;
  yearTableColumnLabel: string;
  reinvestColumnLabel: string;
  reinvestmentPlanTableHelpText: string;
  customDripValuesColumnLabel: (currency: string) => string;
  customDripValuesTableHelpText: (currency: string) => string;
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

export function content(): Content {
  return {
    settings: {
      currencyLabel: "Currency",
      currencyHelpText:
        "Select the FIAT currency to convert DRIP to for the calculations",
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
        downtrend: "Down Trend",
        stable: "Stable",
        uptrend: "Up Trend",
      },
      uptrendMaxValueLabel: "Up Trend Max Value",
      uptrendMaxValueHelpText: (currency: string) =>
        `The maximum value the DRIP token will reach in ${currency}`,
      downtrendMinValueLabel: "Down Trend Min Value",
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
      monthTableColumnLabel: "Month",
      yearTableColumnLabel: "Year",
      reinvestColumnLabel: "Reinvest %",
      reinvestmentPlanTableHelpText:
        'Edit the "Reinvest %" column for each month and then save your changes. You can add more months if you need to.',
      customDripValuesColumnLabel: (currency: string) =>
        `DRIP Value ${currency}`,
      customDripValuesTableHelpText: (currency: string) =>
        `Edit the "DRIP Value ${currency}" column for each month and then save your changes. You can add more months if you need to.`,
    },
    results: {
      earningsMonthLabel: "Earnings (DRIP)",
      earningsMonthHelpText:
        "The total earnings in DRIP for the month from your 1% daily rewards, this is before deciding whether to hydrate or claim each day.",
      earningsMonthInCurrencyLabel: (currency: string) =>
        `Earnings ${currency} (Est.)`,
      earningsMonthInCurrencyHelpText: (currency: string) =>
        `The total estimated earnings in ${currency} for the month from your 1% daily rewards. This is based on the value of DRIP in ${currency} each day.`,
      reinvestMonthLabel: "Reinvest (DRIP)",
      reinvestMonthHelpText:
        "The total re-invested in DRIP after the 5% compound (hydrate) tax",
      reinvestMonthInCurrencyLabel: (currency: string) =>
        `Reinvest ${currency} (Est.)`,
      reinvestMonthInCurrencyHelpText: (currency: string) =>
        `The total estimated in ${currency} for the month that is reinvested into your faucet deposit balance. This is based on the value of DRIP in ${currency} each day.`,
      monthTableColumnLabel: "Month",
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
        `The total estimated earnings in ${currency} for the year from your 1% daily rewards. This is based on the value of DRIP in ${currency} each day.`,
      yearClaimedLabel: "Claimed (DRIP)",
      yearClaimedHelpText:
        "The total claimed to your own wallet in DRIP after the 10% claim tax",
      yearClaimedInCurrencyLabel: (currency: string) =>
        `Claimed ${currency} (Est.)`,
      yearClaimedInCurrencyHelpText: (currency: string) =>
        `The total estimated in ${currency} for the year claimed out into your own wallet. This is based on the value of DRIP in ${currency} each day.`,
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
  };
}

export default createContext(content());
