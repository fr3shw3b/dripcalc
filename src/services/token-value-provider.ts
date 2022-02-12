import chance from "chance";
import moment from "moment";

export interface TokenValueProvider {
  getValueForMonth(
    startDate: Date,
    monthDate: Date,
    startTokenValue: number,
    targetTokenValue: number,
    tokenValueTrend: string,
    trendPeriod?: TrendPeriod,
    lastCustomTokenValueDate?: Date
  ): number;
  applyVariance(inputTokenValue: number): number;
}

export type TrendPeriod = "tenYears" | "fiveYears" | "twoYears" | "oneYear";

function tokenValueProvider(): TokenValueProvider {
  return {
    getValueForMonth: (
      startDate: Date,
      monthDate: Date,
      startTokenValue: number,
      targetTokenValue: number,
      tokenValueTrend: string,
      trendPeriod: TrendPeriod = "tenYears",
      lastCustomTokenValueDate?: Date
    ): number => {
      const trendStartDate = lastCustomTokenValueDate
        ? // Add a month to last custom token value date so the custom token value
          // applies for the entirety of that month and the trend kicks in the following month.
          moment(lastCustomTokenValueDate).add(1, "month").toDate()
        : startDate;
      const yearArrIndex =
        monthDate.getFullYear() - trendStartDate.getFullYear();
      const trendBoundaryIndex = TOKEN_TREND_BOUNDARY_INDEX[trendPeriod];
      if (yearArrIndex > 9) {
        console.warn(
          `Surpassed ${trendBoundaryIndex + 1} ${
            trendBoundaryIndex > 0 ? "years" : "year"
          }, target value will be used (max for up trend, min for down trend and stabilise at value for the stable trend).`
        );
      }

      const monthIndex = monthDate.getMonth();
      const dripTrendBaseValues =
        TOKEN_MONTH_BASE_VALUES[trendPeriod][tokenValueTrend];
      if (!dripTrendBaseValues) {
        throw new Error(
          `"${tokenValueTrend}" is not a valid token trend, must be "downtrend", "uptrend" or "stable"`
        );
      }

      const baseValueFraction =
        yearArrIndex <= trendBoundaryIndex
          ? dripTrendBaseValues[yearArrIndex][monthIndex]
          : DEFAULT_TOKEN_VALUE_TREND[tokenValueTrend];

      if (tokenValueTrend === "downtrend") {
        const downtrendDiff = startTokenValue - targetTokenValue;
        // Example:
        // startTokenValue <- 65
        // targetTokenValue <- 30
        // baseValueFraction <- 0.2
        //
        // 65 - 30 = 35
        // 30 + (35 * 0.2) = 37
        return targetTokenValue + baseValueFraction * downtrendDiff;
      }

      if (tokenValueTrend === "uptrend") {
        const uptrendDiff = targetTokenValue - startTokenValue;
        // Example:
        // startTokenValue <- 65
        // targetTokenValue <- 800
        // baseValueFraction <- 0.3
        //
        // 800 - 65 = 735
        // 65 + (735 * 0.2) = 212
        return startTokenValue + baseValueFraction * uptrendDiff;
      }

      if (targetTokenValue < startTokenValue) {
        // Stable trend going down from start value.
        const lowerBound = targetTokenValue / 2;
        const stableDiff = startTokenValue - lowerBound;
        // Example:
        // startTokenValue <- 65
        // targetTokenValue <- 40 (stabilises at)
        // baseValueFraction <- 0.3
        // lowerBound <- targetTokenValue / 2 = 20
        //
        // 65 - 20 = 45
        // 20 + (45 * 0.3) = 33.5
        return lowerBound + stableDiff * baseValueFraction;
      }

      // Stable trend going up from start value.
      // Simplified version where 0 = targetDripValue not 0.375!
      // In practise stabilising going up really stabilises at (diff * 0.375)!
      const diff = targetTokenValue - startTokenValue;
      // Example:
      // startTokenValue <- 35
      // targetTokenValue <- 80 (stabilises at)
      // baseValueFraction <- 0.3
      //
      // 80 - 35 = 45
      // 80 - (45 * 0.3) = 66.5
      return targetTokenValue - diff * baseValueFraction;
    },
    applyVariance: (inputTokenValue: number): number => {
      return applyTokenValueVariance(inputTokenValue);
    },
  } as const;
}

function applyTokenValueVariance(tokenValueForMonth: number): number {
  // Applies a randomised variance to token value for a day
  // in a month to simulate daily price changes.
  // A range of 15% variance 7.5% in each direction.
  const range = tokenValueForMonth * 0.15;
  return weightedRandomDistrib(
    tokenValueForMonth - range / 2,
    tokenValueForMonth + range / 2,
    tokenValueForMonth,
    3
  );
}

const chanceInstance = chance.Chance();

function weightedRandomDistrib(
  min: number,
  max: number,
  mean: number,
  varianceFactor: number
) {
  let prob = [],
    seq = [];
  for (let i = min; i < max; i++) {
    prob.push(Math.pow(max - Math.abs(mean - i), varianceFactor));
    seq.push(i);
  }
  return chanceInstance.weighted(seq, prob);
}

const TOKEN_TREND_BOUNDARY_INDEX: Record<TrendPeriod, number> = {
  oneYear: 0,
  twoYears: 1,
  fiveYears: 4,
  tenYears: 9,
};

const DEFAULT_TOKEN_VALUE_TREND: Record<string, number> = {
  downtrend: 0,
  stable: 0.375,
  uptrend: 1,
};

// Provides 0 to 1 real numbers for each trend
// that can apply up to N years. The start date should be the last
// custom token value input, this goes on the assumption that users fill
// in actual token values as months pass.
// For each trend there is a 2d array [yearIndex][monthBaseValue].
const TOKEN_MONTH_BASE_VALUES: Record<
  TrendPeriod,
  Record<string, number[][]>
> = {
  oneYear: {
    // 1 is the last custom input/trend start value and 0 is the down trend
    // minimum value.
    downtrend: [
      [
        1, 0.73, 0.54, 0.35, 0.297, 0.205, 0.147, 0.125, 0.085, 0.049, 0.029,
        0.019,
      ],
    ],
    // 1 is the last custom input/trend start value and 0 is the stabilises
    // at value - (stabilises at value / 2).
    // Stabilises at value is 0.375.
    stable: [
      [
        1, 0.73, 0.6, 0.35, 0.297, 0.31, 0.375, 0.297, 0.297, 0.198, 0.297,
        0.37,
      ],
    ],
    // 0 is the last custom input/trend start value and 1 is the up trend
    // maximum value.
    uptrend: [
      [0, 0.049, 0.085, 0.125, 0.147, 0.297, 0.35, 0.53, 0.6, 0.73, 0.81, 1],
    ],
  },
  twoYears: {
    downtrend: [
      [1, 0.93, 0.8, 0.73, 0.6, 0.54, 0.49, 0.35, 0.32, 0.297, 0.254, 0.205],
      [
        0.184, 0.16, 0.147, 0.135, 0.125, 0.093, 0.085, 0.049, 0.037, 0.029,
        0.025, 0.019,
      ],
    ],
    stable: [
      [1, 0.94, 0.8, 0.73, 0.65, 0.6, 0.35, 0.297, 0.31, 0.294, 0.3, 0.31],
      [
        0.375, 0.297, 0.297, 0.198, 0.297, 0.37, 0.34, 0.31, 0.357, 0.37, 0.32,
        0.375,
      ],
    ],
    uptrend: [
      [
        0, 0.049, 0.085, 0.125, 0.137, 0.147, 0.172, 0.87, 0.195, 0.243, 0.297,
        0.33,
      ],
      [0.35, 0.42, 0.53, 0.57, 0.6, 0.68, 0.73, 0.84, 0.81, 0.87, 0.92, 1],
    ],
  },
  fiveYears: {
    downtrend: [
      [1, 1, 0.95, 0.97, 0.8, 0.9, 1, 0.95, 0.92, 0.8, 0.77, 0.73],
      [
        0.613, 0.549, 0.463, 0.31, 0.343, 0.326, 0.224, 0.2, 0.186, 0.193, 0.2,
        0.19,
      ],
      [
        0.125, 0.114, 0.143, 0.152, 0.122, 0.128, 0.114, 0.107, 0.095, 0.087,
        0.1, 0.098,
      ],
      [
        0.049, 0.074, 0.063, 0.052, 0.07, 0.054, 0.049, 0.042, 0.055, 0.047,
        0.035, 0.03,
      ],
      [0.019, 0.021, 0.015, 0.01, 0.014, 0, 0, 0, 0.02, 0, 0.01, 0],
    ],
    stable: [
      [1, 1, 0.95, 0.97, 0.8, 0.9, 1, 0.95, 0.92, 0.8, 0.77, 0.73],
      [0.7, 0.57, 0.42, 0.45, 0.39, 0.37, 0.3, 0.31, 0.305, 0.293, 0.29, 0.312],
      [
        0.375, 0.39, 0.263, 0.259, 0.243, 0.375, 0.3, 0.43, 0.386, 0.3, 0.375,
        0.36,
      ],
      [
        0.297, 0.45, 0.363, 0.259, 0.243, 0.375, 0.3, 0.296, 0.386, 0.3, 0.375,
        0.36,
      ],
      [
        0.37, 0.249, 0.263, 0.348, 0.243, 0.375, 0.3, 0.296, 0.386, 0.3, 0.375,
        0.36,
      ],
    ],
    uptrend: [
      [0.019, 0.021, 0.015, 0.01, 0.014, 0, 0, 0, 0.02, 0, 0.01, 0].reverse(),
      [
        0.049, 0.074, 0.063, 0.052, 0.07, 0.054, 0.049, 0.042, 0.055, 0.047,
        0.035, 0.03,
      ].reverse(),
      [
        0.125, 0.114, 0.143, 0.152, 0.122, 0.128, 0.114, 0.107, 0.095, 0.087,
        0.1, 0.098,
      ].reverse(),
      [
        0.613, 0.549, 0.463, 0.31, 0.343, 0.326, 0.224, 0.2, 0.186, 0.193, 0.2,
        0.19,
      ],
      [1, 1, 0.95, 0.97, 0.8, 0.9, 1, 0.95, 0.92, 0.8, 0.77, 0.73].reverse(),
    ],
  },
  tenYears: {
    downtrend: [
      [1, 1, 0.95, 0.97, 0.8, 0.9, 1, 0.95, 0.92, 0.8, 0.77, 0.73],
      [0.73, 0.5, 0.61, 0.53, 0.59, 0.7, 0.65, 0.6, 0.57, 0.52, 0.49, 0.4],
      [
        0.35, 0.37, 0.32, 0.45, 0.39, 0.37, 0.3, 0.31, 0.305, 0.293, 0.29,
        0.312,
      ],
      [
        0.297, 0.249, 0.263, 0.21, 0.243, 0.198, 0.224, 0.2, 0.186, 0.193, 0.2,
        0.19,
      ],
      [
        0.147, 0.183, 0.173, 0.162, 0.192, 0.148, 0.124, 0.157, 0.121, 0.104,
        0.11, 0.13,
      ],
      [
        0.125, 0.114, 0.143, 0.152, 0.122, 0.128, 0.114, 0.107, 0.095, 0.087,
        0.1, 0.098,
      ],
      [
        0.085, 0.074, 0.093, 0.082, 0.1, 0.094, 0.084, 0.101, 0.095, 0.087,
        0.075, 0.065,
      ],
      [
        0.049, 0.074, 0.063, 0.052, 0.07, 0.054, 0.049, 0.042, 0.055, 0.047,
        0.045, 0.04,
      ],
      [
        0.029, 0.034, 0.043, 0.032, 0.05, 0.034, 0.039, 0.022, 0.025, 0.037,
        0.025, 0.02,
      ],
      [0.019, 0.021, 0.015, 0.01, 0.014, 0, 0, 0, 0.02, 0, 0.01, 0],
    ],
    stable: [
      [1, 1, 0.95, 0.97, 0.8, 0.9, 1, 0.95, 0.92, 0.8, 0.77, 0.73],
      [0.73, 0.5, 0.61, 0.53, 0.59, 0.7, 0.65, 0.6, 0.57, 0.52, 0.49, 0.4],
      [
        0.35, 0.37, 0.32, 0.45, 0.39, 0.37, 0.3, 0.31, 0.305, 0.293, 0.29,
        0.312,
      ],
      [
        0.297, 0.249, 0.263, 0.259, 0.243, 0.375, 0.3, 0.296, 0.386, 0.3, 0.375,
        0.36,
      ],
      [
        0.375, 0.39, 0.263, 0.259, 0.243, 0.375, 0.3, 0.43, 0.386, 0.3, 0.375,
        0.36,
      ],
      [
        0.297, 0.249, 0.263, 0.259, 0.243, 0.369, 0.3, 0.296, 0.386, 0.3, 0.375,
        0.36,
      ],
      [
        0.297, 0.45, 0.363, 0.259, 0.243, 0.375, 0.3, 0.296, 0.386, 0.3, 0.375,
        0.36,
      ],
      [
        0.198, 0.249, 0.263, 0.259, 0.243, 0.375, 0.3, 0.296, 0.386, 0.3, 0.375,
        0.36,
      ],
      [
        0.297, 0.249, 0.263, 0.259, 0.243, 0.375, 0.3, 0.296, 0.386, 0.3, 0.375,
        0.36,
      ],
      [
        0.37, 0.249, 0.263, 0.348, 0.243, 0.375, 0.3, 0.296, 0.386, 0.3, 0.375,
        0.36,
      ],
    ],
    uptrend: [
      [0.019, 0.021, 0.015, 0.01, 0.014, 0, 0, 0, 0.02, 0, 0.01, 0].reverse(),
      [
        0.029, 0.034, 0.043, 0.032, 0.05, 0.034, 0.039, 0.022, 0.025, 0.037,
        0.025, 0.02,
      ].reverse(),
      [
        0.049, 0.074, 0.063, 0.052, 0.07, 0.054, 0.049, 0.042, 0.055, 0.047,
        0.045, 0.04,
      ].reverse(),
      [
        0.085, 0.074, 0.093, 0.082, 0.1, 0.094, 0.084, 0.101, 0.095, 0.087,
        0.075, 0.065,
      ].reverse(),
      [
        0.125, 0.114, 0.143, 0.152, 0.122, 0.128, 0.114, 0.107, 0.095, 0.087,
        0.1, 0.098,
      ].reverse(),
      [
        0.147, 0.183, 0.173, 0.162, 0.192, 0.148, 0.124, 0.157, 0.121, 0.104,
        0.11, 0.13,
      ].reverse(),
      [
        0.297, 0.249, 0.263, 0.21, 0.243, 0.198, 0.224, 0.2, 0.186, 0.193, 0.2,
        0.19,
      ].reverse(),
      [
        0.35, 0.37, 0.32, 0.45, 0.39, 0.37, 0.3, 0.31, 0.305, 0.293, 0.29,
        0.312,
      ].reverse(),
      [
        0.73, 0.5, 0.61, 0.53, 0.59, 0.7, 0.65, 0.6, 0.57, 0.52, 0.49, 0.4,
      ].reverse(),
      [1, 1, 0.95, 0.97, 0.8, 0.9, 1, 0.95, 0.92, 0.8, 0.77, 0.73].reverse(),
    ],
  },
};

export default tokenValueProvider;
