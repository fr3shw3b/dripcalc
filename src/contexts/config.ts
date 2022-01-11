import { createContext } from "react";

export type Config = {
  hydrateTax: number;
  depositTax: number;
  maxPayoutCap: number;
  dailyCompound: number;
  depositMultiplier: number;
  claimWhaleTaxThresholds: Record<string, number>;
  totalDripSupply: number;
  maxDepositBalance: number;
  minWalletStartDate: string;
  maxWalletStartDate: string;
};

const MAX_PAYOUT_CAP = 100000;
const DEPOSIT_MULTIPLIER = 3.65;

export function config(): Config {
  return {
    hydrateTax: 0.05,
    depositTax: 0.1,
    maxPayoutCap: MAX_PAYOUT_CAP,
    dailyCompound: 0.01,
    depositMultiplier: DEPOSIT_MULTIPLIER,
    claimWhaleTaxThresholds: {
      "0.00": 0,
      "0.01": 0.05,
      "0.02": 0.1,
      "0.03": 0.15,
      "0.04": 0.2,
      "0.05": 0.25,
      "0.06": 0.3,
      "0.07": 0.35,
      "0.08": 0.4,
      "0.09": 0.45,
      "0.10": 0.5,
    },
    totalDripSupply: 1000000,
    maxDepositBalance: MAX_PAYOUT_CAP / DEPOSIT_MULTIPLIER,
    minWalletStartDate: "01/01/2022",
    maxWalletStartDate: "12/31/2032",
  };
}

export default createContext(config());
