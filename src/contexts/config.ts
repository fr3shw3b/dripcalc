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
  maxGardenDailyYieldPercentage: number;
  seedsPerPlant: number;
  nativeDexPriceApiBaseUrl: string;
  priceRefreshInterval: number;
  dripcalcApiBaseUrl: string;
  refreshExchangeRatesInterval: number;
  pancakeSwapApiBaseUrl: string;
  bscDataSeedUrl: string;
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
    // Have a max default to a plant (2592000 seeds) being 15% of the value of a DRIP/BUSD LP token.
    // Unless a user overrides the value of plant:LP ratio, this is the ceiling!
    // This is a conservative limit, a plant can be worth more than 10% of an LP token.
    defaultMaxPlantDripBUSDLPFraction: 0.15,
    // A plant:LP ratio can go as low as 0.0000001(Plant):1(LP) or 0.00001%.
    minPlantDripBUSDLPFraction: 0.0000001,
    // Default to 2% for the garden daily yield to be cautious.
    // It tends to fluctuate between 1-3% based on activity of
    // gardeners as well as personal habits.
    // This is a bit on the lenient side assuming the user is close to keeping
    // up with compounding rate of the average user in the system.
    defaultAverageGardenYieldPercentage: 0.02,
    // It's possible this can go higher for some people, to be on the cautious
    // side let's set a limit of 3.33% as that is ~86400 daily seed rate
    // that seems to be consistent when only compounding.
    maxGardenDailyYieldPercentage: 0.03333,
    // As per the smart contract!
    seedsPerPlant: 2592000,
    ////////////////////////////////////////////////////////////////////////////////////////
    // API configuration and other values worth configuring outside of source code.
    ///////////////////////////////////////////////////////////////////////////////////////
    nativeDexPriceApiBaseUrl:
      process.env.REACT_APP_NATIVE_DEX_PRICE_API_BASE_URL ?? "",
    priceRefreshInterval: Number.parseInt(
      process.env.REACT_APP_PRICE_REFRESH_INTERVAL_MILLISECONDS ?? "0"
    ),
    dripcalcApiBaseUrl: process.env.REACT_APP_DRIPCALC_API_BASE_URL ?? "",
    refreshExchangeRatesInterval: Number.parseInt(
      process.env.REACT_APP_EXCHANGE_RATES_REFRESH_INTERVAL_MILLISECONDS ?? "0"
    ),
    pancakeSwapApiBaseUrl:
      process.env.REACT_APP_PANCAKE_SWAP_API_BASE_URL ?? "",
    bscDataSeedUrl: process.env.REACT_APP_BSC_DATA_SEED_URL ?? "",
  };
}

export default createContext(config());
