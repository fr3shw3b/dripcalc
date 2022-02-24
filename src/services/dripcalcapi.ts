export interface DripCalcApi {
  getExchangeRates(): Promise<ExchangeRates>;
}

export type ExchangeRates = {
  timestamp: number;
  base: string;
  rates: Record<string, number>;
};

export type DripCalcApiOptions = {
  baseUrl: string;
  refreshExchangeRatesInterval: number;
};

function dripCalcApi({
  baseUrl,
  refreshExchangeRatesInterval,
}: DripCalcApiOptions): DripCalcApi {
  let exchangeRates: ExchangeRates;
  let lastFetchTime = -1;

  return {
    getExchangeRates: async () => {
      const nowInMilliseconds = Date.now();
      if (
        exchangeRates &&
        lastFetchTime > -1 &&
        nowInMilliseconds - lastFetchTime < refreshExchangeRatesInterval
      ) {
        return exchangeRates;
      }

      const response = await fetch(`${baseUrl}/exchange-rates`);
      const data: ExchangeRates = await response.json();

      exchangeRates = data;
      lastFetchTime = Date.now();
      return exchangeRates;
    },
  } as const;
}

export default dripCalcApi;
