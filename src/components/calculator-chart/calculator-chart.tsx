import { Position, Switch } from "@blueprintjs/core";
import { Tooltip2 } from "@blueprintjs/popover2";
import moment from "moment";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  createContainer,
  VictoryAxis,
  VictoryChart,
  VictoryLegend,
  VictoryLine,
  VictoryTooltip,
  VictoryVoronoiContainerProps,
  VictoryZoomContainerProps,
} from "victory";
import type { DomainTuple } from "victory-core";

import {
  GardenMonthEarningsAndInfo,
  GardenYearEarnings,
  MonthEarningsAndInfo,
  WalletEarnings,
  WalletGardenEarnings,
  YearEarnings,
} from "../../store/middleware/shared-calculator-types";
import { AppState } from "../../store/types";

import chartTheme from "../../utils/chart-theme";
import formatCurrency from "../../utils/currency";

import "./calculator-chart.css";

type Props = {
  forCalculator: "garden" | "faucet";
};

function CalculatorChart({ forCalculator }: Props) {
  const tokenName = tokenLabels[forCalculator];
  const tokenEarningsLineLabel = `${tokenName} Earnings`;
  const tokenReinvestedLineLabel = `${tokenName} Reinvested`;
  const tokenClaimedLineLabel = `${tokenName} Claimed`;

  const { walletEarnings, walletLabel, currency } = useSelector(
    (state: AppState) => {
      const currentPlanId = state.plans.current;
      const currentPlan = state.plans.plans.find(
        (plan) => plan.id === currentPlanId
      );
      const currentWalletId = currentPlan?.current;
      const planEarnings = state.general.calculatedEarnings[currentPlanId];
      const currentWalletEarnings =
        forCalculator === "faucet"
          ? planEarnings?.walletEarnings[currentWalletId as string]
          : planEarnings?.gardenEarnings.walletEarnings[
              currentWalletId as string
            ];
      return {
        walletEarnings: currentWalletEarnings,
        currency: state.settings[currentPlanId].currency,
        walletLabel:
          currentPlan?.wallets?.find((wallet) => wallet.id === currentWalletId)
            ?.label ?? "",
      };
    }
  );

  const [fiatChart, setFiatChart] = useState(false);
  const [datasets, setDatasets] = useState<Datasets>({
    tokenEarnings: [],
    tokenClaimed: [],
    tokenReinvested: [],
  });

  const [zoomDomain, setZoomDomain] = useState<
    | {
        x?: DomainTuple;
        y?: DomainTuple;
      }
    | undefined
  >(undefined);

  useEffect(() => {
    if (walletEarnings) {
      const newDatasets = toDataPoints(walletEarnings, fiatChart, currency);
      setDatasets(newDatasets);
      setZoomDomain(undefined);
    }
  }, [walletEarnings, fiatChart, currency]);

  return (
    <div className="calculator-chart-container">
      <p>
        This chart provides a visual representation of your earnings for "
        {walletLabel}", scroll to zoom and drag to pan.
      </p>
      {forCalculator === "faucet" && (
        <p>
          <strong>
            Claimed and reinvested data points are after all the DRIP faucet
            taxes are applied!
          </strong>
        </p>
      )}
      <Tooltip2
        content={
          fiatChart
            ? `Switch off to view earnings in ${tokenName}`
            : `Switch on to view earnings in ${currency}`
        }
        position={Position.BOTTOM}
        openOnTargetFocus={false}
      >
        <Switch
          checked={fiatChart}
          label={`${tokenName} or ${currency}`}
          alignIndicator="right"
          onChange={() => setFiatChart((prevState) => !prevState)}
        />
      </Tooltip2>
      <div className="calculator-chart">
        <VictoryChart
          theme={chartTheme}
          containerComponent={
            <VictoryZoomVoronoiContainer
              zoomDomain={zoomDomain}
              onZoomDomainChange={(domain) => setZoomDomain(domain)}
            />
          }
          scale={{ x: "time", y: "linear" }}
        >
          <VictoryAxis
            dependentAxis
            style={{
              grid: { stroke: "grey" },
            }}
            tickFormat={(tick) =>
              fiatChart
                ? formatCurrency(currency, tick)
                : new Intl.NumberFormat("en-US", {
                    maximumSignificantDigits: 3,
                  }).format(tick)
            }
          />
          <VictoryAxis
            style={{
              grid: { stroke: "grey" },
            }}
          />
          <VictoryLine
            name={tokenEarningsLineLabel}
            style={{
              data: {
                stroke: "#68C1F9",
              },
            }}
            labelComponent={<VictoryTooltip />}
            data={datasets.tokenEarnings}
          />
          <VictoryLine
            name={tokenReinvestedLineLabel}
            style={{
              data: {
                stroke: "#0D8050",
              },
            }}
            labelComponent={<VictoryTooltip />}
            data={datasets.tokenReinvested}
          />
          <VictoryLine
            name={tokenClaimedLineLabel}
            style={{
              data: {
                stroke: "#C23030",
              },
            }}
            labelComponent={<VictoryTooltip />}
            data={datasets.tokenClaimed}
          />
          <VictoryLegend
            x={50}
            y={50}
            centerTitle
            orientation="vertical"
            gutter={20}
            data={[
              { name: tokenEarningsLineLabel, symbol: { fill: "#68C1F9" } },
              { name: tokenReinvestedLineLabel, symbol: { fill: "#0D8050" } },
              { name: tokenClaimedLineLabel, symbol: { fill: "#C23030" } },
            ]}
          />
        </VictoryChart>
      </div>
    </div>
  );
}

const VictoryZoomVoronoiContainer = createContainer<
  VictoryZoomContainerProps,
  VictoryVoronoiContainerProps
>("zoom", "voronoi");

const tokenLabels = {
  garden: "DRIP/BUSD LP",
  faucet: "DRIP",
};

type DataPoint = {
  x: Date;
  y: number;
  label: string;
};

type Datasets = {
  tokenEarnings: DataPoint[];
  tokenClaimed: DataPoint[];
  tokenReinvested: DataPoint[];
};

function toDataPoints(
  walletEarnings: WalletEarnings | WalletGardenEarnings | undefined,
  inFiatCurrency: boolean,
  currency: "$" | "£" | "€"
): Datasets {
  if (!walletEarnings) {
    return { tokenEarnings: [], tokenClaimed: [], tokenReinvested: [] };
  }

  const seed: Datasets = {
    tokenEarnings: [],
    tokenClaimed: [],
    tokenReinvested: [],
  };
  return Object.entries(walletEarnings.yearEarnings).reduce(
    (
      datasets,
      [year, yearEarnings]: [string, YearEarnings | GardenYearEarnings]
    ) => {
      return collectYearEarningDataPoints(
        datasets,
        Number.parseInt(year),
        yearEarnings,
        inFiatCurrency,
        currency
      );
    },
    seed
  );
}

function collectYearEarningDataPoints(
  prevDatasets: Datasets,
  year: number,
  yearEarnings: YearEarnings | GardenYearEarnings,
  inFiatCurrency: boolean,
  currency: "$" | "£" | "€"
): Datasets {
  return Object.entries(yearEarnings.monthEarnings).reduce(
    (
      accumDatasets: Datasets,
      [month, monthEarnings]: [
        string,
        MonthEarningsAndInfo | GardenMonthEarningsAndInfo
      ]
    ) => {
      const momentDate = moment(
        `01/${Number.parseInt(month) + 1}/${year}`,
        "D/M/YYYY"
      );
      const timestamp = Number.parseInt(momentDate.format("x"), 10);
      const monthLabel = momentDate.format("MMMM YYYY");
      if (isFaucetMonthEarnings(monthEarnings)) {
        return {
          tokenEarnings: [
            ...accumDatasets.tokenEarnings,
            {
              x: new Date(timestamp),
              y: inFiatCurrency
                ? monthEarnings.monthEarningsInCurrency
                : monthEarnings.monthEarnings,
              label: inFiatCurrency
                ? `${formatCurrency(
                    currency,
                    monthEarnings.monthEarningsInCurrency
                  )} earned in ${monthLabel}`
                : `${monthEarnings.monthEarnings} DRIP earned in ${monthLabel}`,
            },
          ],
          tokenClaimed: [
            ...accumDatasets.tokenClaimed,
            {
              x: new Date(timestamp),
              y: inFiatCurrency
                ? monthEarnings.monthClaimedInCurrency
                : monthEarnings.monthClaimedAfterTax,
              label: inFiatCurrency
                ? `${formatCurrency(
                    currency,
                    monthEarnings.monthClaimedInCurrency
                  )} claimed in ${monthLabel}`
                : `${monthEarnings.monthClaimedAfterTax} DRIP claimed in ${monthLabel}`,
            },
          ],
          tokenReinvested: [
            ...accumDatasets.tokenReinvested,
            {
              x: new Date(timestamp),
              y: inFiatCurrency
                ? monthEarnings.monthReinvestedInCurrency
                : monthEarnings.monthReinvestedAfterTax,
              label: inFiatCurrency
                ? `${formatCurrency(
                    currency,
                    monthEarnings.monthReinvestedInCurrency
                  )} reinvested in ${monthLabel}`
                : `${monthEarnings.monthReinvestedAfterTax} DRIP reinvested in ${monthLabel}`,
            },
          ],
        };
      }

      return {
        tokenEarnings: [
          ...accumDatasets.tokenEarnings,
          {
            x: new Date(timestamp),
            y: inFiatCurrency
              ? monthEarnings.monthEarningsInCurrency
              : monthEarnings.monthEarningsInDripBUSDLP,
            label: inFiatCurrency
              ? `${formatCurrency(
                  currency,
                  monthEarnings.monthEarningsInCurrency
                )} earned in ${monthLabel}`
              : `${monthEarnings.monthEarningsInDripBUSDLP} DRIP/BUSD LP earned in ${monthLabel}`,
          },
        ],
        tokenClaimed: [
          ...accumDatasets.tokenClaimed,
          {
            x: new Date(timestamp),
            y: inFiatCurrency
              ? monthEarnings.monthClaimedInCurrency
              : monthEarnings.monthClaimedInDripBUSDLP,
            label: inFiatCurrency
              ? `${formatCurrency(
                  currency,
                  monthEarnings.monthClaimedInCurrency
                )} claimed in ${monthLabel}`
              : `${monthEarnings.monthClaimedInDripBUSDLP} DRIP/BUSD LP claimed in ${monthLabel}`,
          },
        ],
        tokenReinvested: [
          ...accumDatasets.tokenReinvested,
          {
            x: new Date(timestamp),
            y: inFiatCurrency
              ? monthEarnings.monthReinvestedInCurrency
              : monthEarnings.monthReinvestedInDripBUSDLP,
            label: inFiatCurrency
              ? `${formatCurrency(
                  currency,
                  monthEarnings.monthReinvestedInCurrency
                )} reinvested in ${monthLabel}`
              : `${monthEarnings.monthReinvestedInDripBUSDLP} DRIP/BUSD LP reinvested in ${monthLabel}`,
          },
        ],
      };
    },
    prevDatasets
  );
}

function isFaucetMonthEarnings(
  monthEarnings: Record<string, unknown>
): monthEarnings is MonthEarningsAndInfo {
  return typeof monthEarnings.dripDepositBalanceEndOfMonth === "number";
}

export default CalculatorChart;
