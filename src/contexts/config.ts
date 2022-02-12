import { createContext } from "react";

export type Config = {
  hydrateTax: number;
  depositTax: number;
  claimTax: number;
  maxPayoutCap: number;
  dailyCompound: number;
  depositMultiplier: number;
  claimWhaleTaxThresholds: Record<string, number>;
  totalDripSupply: number;
  maxDepositBalance: number;
  minWalletStartDate: string;
  maxWalletStartDate: string;
  cexFeePercentage: number;
  depositBufferFees: number;
  defaultDripValue: number;
  defaultReinvest: number;
  defaultGardenReinvest: number;
  defaultDripBUSDLPValue: number;
  defaultMaxPlantDripBUSDLPFraction: number;
  minPlantDripBUSDLPFraction: number;
  defaultAverageGardenYieldPercentage: number;
  seedsPerPlant: number;
};

const MAX_PAYOUT_CAP = 100000;
const DEPOSIT_MULTIPLIER = 3.65;

export function config(): Config {
  return {
    hydrateTax: 0.05,
    depositTax: 0.1,
    claimTax: 0.1,
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
    minWalletStartDate: "01/12/2021",
    maxWalletStartDate: "12/31/2032",
    depositBufferFees: 3,
    // Binance fee.
    cexFeePercentage: 0.018,
    // £50, $50 or €50 depending on the user's configured currency.
    defaultDripValue: 50,
    // 60% reinvest is the default value users can adjust.
    defaultReinvest: 0.6,
    // 60% reinvest is the default value users can adjust.
    defaultGardenReinvest: 0.6,
    // £30, $30 or €30 depending on the user's configured currency.
    defaultDripBUSDLPValue: 25,
    // Have a max default to a plant (2592000 seeds) being 10% of the value of a DRIP/BUSD LP token.
    // Unless a user overrides the value of plant:LP ratio, this is the ceiling!
    defaultMaxPlantDripBUSDLPFraction: 0.1,
    // A plant:LP ratio can go as low as 0.01(Plant):1(LP) or 1%.
    minPlantDripBUSDLPFraction: 0.01,
    // Default to 1.2% for the garden daily yield.
    // It tends to fluctuate between 1-3%.
    defaultAverageGardenYieldPercentage: 0.012,
    // As per the smart contract!
    seedsPerPlant: 2592000,
  };
}

export default createContext(config());
