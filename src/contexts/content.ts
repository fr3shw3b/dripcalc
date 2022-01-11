import { createContext } from "react";

export type Content = {
  settings: SettingsContent;
  wallets: WalletsContent;
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
  createNewWalletButtonText: string;
  newWalletNameFieldLabel: string;
  newWalletDateFieldName: string;
  newWalletDateHelpText: string;
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
        "The trend of the DRIP token value from the moment you open your first wallet" +
        " to the moment all rewards have been consumed in your last wallet.",
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
      createNewWalletButtonText: "new wallet",
      newWalletNameFieldLabel: "Name",
      newWalletDateFieldName: "Start Date",
      newWalletDateHelpText:
        "The date on which the new wallet starts, this is the month you make your first deposit in the new wallet.",
    },
  };
}

export default createContext(content());
