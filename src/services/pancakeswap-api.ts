import { Config } from "../contexts/config";

export interface PancakeSwapApi {
  getTokenPrice(token: string): Promise<number>;
}

function pancakeSwapApi(config: Config): PancakeSwapApi {
  return {
    getTokenPrice: async (token: string) => {
      const response = await fetch(`${config.pancakeSwapApiBaseUrl}/${token}`);
      const data: PCSTokenInfo = await response.json();
      return Number.parseFloat(data.data.price);
    },
  } as const;
}

type PCSTokenInfo = {
  data: {
    name: string;
    symbol: string;
    price: string;
    price_BNB: string;
  };
  updated_at: number;
};

export default pancakeSwapApi;
