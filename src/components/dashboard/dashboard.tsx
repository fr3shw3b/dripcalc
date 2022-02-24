import { Button, Card, Elevation } from "@blueprintjs/core";
import { MouseEventHandler, useContext } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  DayEarnings,
  EarningsAndInfo,
} from "../../store/middleware/shared-calculator-types";

import { AppState } from "../../store/types";
import formatCurrency from "../../utils/currency";
import Help from "../help";
import ContentContext from "../../contexts/content";
import FeatureTogglesContext from "../../contexts/feature-toggles";

import "./dashboard.css";
import { GardenDayAction } from "../../store/reducers/plans";
import moment from "moment";

function Dashboard() {
  const navigate = useNavigate();

  const { dashboard: dashboardContent } = useContext(ContentContext);
  const featureToggles = useContext(FeatureTogglesContext);
  const {
    dayEarnings,
    dayDripValue,
    dayEarningsInCurrency,
    walletActionsForDay,
    wallets,
    currency,
    isFirstTime,
    gardenDayEarningsInfo,
    fiatMode: fiatModeInState,
  } = useSelector((state: AppState) => {
    const currentPlanId = state.plans.current;
    const currentPlan = state.plans.plans.find(
      (plan) => plan.id === currentPlanId
    );
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const currentDayOfMonth = currentDate.getDate();
    const calculatedEarnings = state.general.calculatedEarnings[currentPlanId];
    const dayEarningsInfo = getDayEarnings(
      currentYear,
      currentMonth,
      currentDayOfMonth,
      calculatedEarnings
    );
    const gardenDayEarningsInfo = getGardenDayEarnings(
      currentYear,
      currentMonth,
      currentDayOfMonth,
      calculatedEarnings
    );
    return {
      ...state.general,
      dayEarnings: dayEarningsInfo.dayEarnings,
      dayEarningsInCurrency: dayEarningsInfo.dayEarningsInCurrency,
      walletActionsForDay: dayEarningsInfo.walletActionsForDay,
      dayDripValue: dayEarningsInfo.dripValue,
      currency: state.settings[currentPlanId].currency,
      wallets: currentPlan?.wallets ?? [],
      isFirstTime: state.general.isFirstTime,
      gardenDayEarningsInfo,
    };
  });

  const fiatMode =
    (featureToggles.dripFiatModeToggle && fiatModeInState) ||
    !featureToggles.dripFiatModeToggle;

  const handleGetStartedFaucetClick: MouseEventHandler = (evt) => {
    evt.preventDefault();
    navigate("/faucet/dashboard");
  };

  const handleGetStartedGardenClick: MouseEventHandler = (evt) => {
    evt.preventDefault();
    navigate("/drip-garden/dashboard");
  };

  // const handleGetStartedFarmClick: MouseEventHandler = (evt) => {
  //   evt.preventDefault();
  //   navigate("/animal-farm/dashboard");
  // };

  const renderFirstTimeView = () => {
    return (
      <>
        <div className="dashboard-intro">
          <h1>Welcome to dripcalc!</h1>
          <p>
            This tool is a calculator for your long term earnings from the DRIP
            Faucet, DRIP LP Garden and The Animal Farm (Coming soon).
          </p>
          <div className="dashboard-cards-container">
            <Card
              className="dashboard-card"
              interactive={false}
              elevation={Elevation.TWO}
            >
              <h3>DRIP Faucet</h3>
              <p>
                Plan your strategy in the{" "}
                <a
                  href="https://drip.community/faucet"
                  target="_blank"
                  rel="noreferrer"
                >
                  DRIP Faucet
                </a>
                .
              </p>
              <Button
                className="block"
                intent="primary"
                icon="chevron-right"
                text="Get started in the Faucet"
                onClick={handleGetStartedFaucetClick}
              />
            </Card>
            <Card
              className="dashboard-card"
              interactive={false}
              elevation={Elevation.TWO}
            >
              <h3>DRIP LP Garden</h3>
              <p>
                Plan your strategy in the{" "}
                <a
                  href="https://theanimal.farm/garden"
                  target="_blank"
                  rel="noreferrer"
                >
                  DRIP/BUSD LP Garden
                </a>
                .
              </p>

              {featureToggles.gardenCalculator ? (
                <Button
                  className="block"
                  intent="primary"
                  icon="chevron-right"
                  text="Get started in the Garden"
                  onClick={handleGetStartedGardenClick}
                />
              ) : (
                <p>
                  <strong>DRIP Garden Calculator Coming Soon!</strong>
                </p>
              )}
            </Card>
            <Card
              className="dashboard-card"
              interactive={false}
              elevation={Elevation.TWO}
            >
              <h3>Animal Farm</h3>
              <p>
                Plan your strategy in the{" "}
                <a
                  href="https://theanimal.farm"
                  target="_blank"
                  rel="noreferrer"
                >
                  Animal Farm
                </a>
                .
              </p>
              <p>
                <strong>Animal Farm Calculator Coming This Year!</strong>
              </p>
              {/* <Button
                className="block"
                intent="primary"
                icon="chevron-right"
                text="Get started in the Farm"
                onClick={handleGetStartedFarmClick}
              /> */}
            </Card>
          </div>
        </div>
      </>
    );
  };

  const renderStatsView = () => {
    return (
      <>
        <div className="dashboard-cards-container">
          <Card
            className="dashboard-card"
            interactive={false}
            elevation={Elevation.TWO}
          >
            <h2>DRIP Faucet</h2>
            <h3>Estimated earnings for today</h3>
            <p>
              <strong>DRIP: </strong>
              {dayEarnings.toFixed(4)}
            </p>
            {fiatMode && (
              <p className="block-bottom-lg">
                <Help
                  helpContent={
                    <div className="dashboard-info">
                      {dashboardContent.faucetDayEarningsInCurrencyHelpText(
                        currency,
                        formatCurrency(currency, dayDripValue)
                      )}
                    </div>
                  }
                >
                  <span>{formatCurrency(currency, dayEarningsInCurrency)}</span>
                </Help>
              </p>
            )}

            <h3>Actions for today</h3>

            <div className="block-bottom-lg">
              {walletActionsForDay.map(([walletId, action]) => {
                const wallet = wallets.find(
                  (current) => current.id === walletId
                );
                return (
                  <p key={walletId}>
                    {action} for{" "}
                    <strong>
                      <i>{wallet?.label}</i>
                    </strong>
                  </p>
                );
              })}
            </div>
            <Button
              className="block"
              intent="primary"
              icon="chevron-right"
              text="Faucet Calculator"
              onClick={handleGetStartedFaucetClick}
            />
          </Card>
          {featureToggles.gardenCalculator && (
            <Card
              className="dashboard-card"
              interactive={false}
              elevation={Elevation.TWO}
            >
              <h2>DRIP LP Garden</h2>
              <h3>Estimated earnings for today</h3>
              <p>
                <strong>DRIP/BUSD LP: </strong>
                {gardenDayEarningsInfo.gardenDayEarnings.toFixed(4)}
              </p>
              {fiatMode && (
                <p className="block-bottom-lg">
                  <Help
                    helpContent={
                      <div className="dashboard-info">
                        {dashboardContent.gardenDayEarningsInCurrencyHelpText(
                          currency,
                          formatCurrency(
                            currency,
                            gardenDayEarningsInfo.dripBUSDLPValue
                          )
                        )}
                      </div>
                    }
                  >
                    <span>
                      {formatCurrency(
                        currency,
                        gardenDayEarningsInfo.gardenDayEarningsInCurrency
                      )}
                    </span>
                  </Help>
                </p>
              )}

              <h3>Actions for today</h3>

              <div className="block-bottom-lg">
                {gardenDayEarningsInfo.walletActionsForDay.map(
                  ([walletId, actions]) => {
                    const wallet = wallets.find(
                      (current) => current.id === walletId
                    );
                    return (
                      <p key={walletId}>
                        <strong>
                          <i>For {wallet?.label}</i>
                        </strong>
                        <div className="top-small-margin">
                          <ul className="action-list">
                            {actions.map((action) => (
                              <li key={`${action.action}-${action.timestamp}`}>
                                {actionLabels[action.action]} at{" "}
                                {moment(new Date(action.timestamp)).format(
                                  "HH:mm:ss"
                                )}
                              </li>
                            ))}
                            {actions.length === 0 && (
                              <li>Leave Seeds to Accumulate</li>
                            )}
                          </ul>
                        </div>
                      </p>
                    );
                  }
                )}
              </div>
              <Button
                className="block"
                intent="primary"
                icon="chevron-right"
                text="Garden Calculator"
                onClick={handleGetStartedGardenClick}
              />
            </Card>
          )}
          {/* <Card
            className="dashboard-card"
            interactive={false}
            elevation={Elevation.TWO}
          >
            <h3>Animal Farm</h3>
            <p>
              Plan your strategy in the{" "}
              <a href="https://theanimal.farm" target="_blank" rel="noreferrer">
                Animal Farm
              </a>
              .
            </p>
            <Button
              className="block"
              intent="primary"
              icon="chevron-right"
              text="Farm Calculator"
              onClick={handleGetStartedFarmClick}
            />
          </Card> */}
        </div>
      </>
    );
  };

  return (
    <div className="dashboard">
      {isFirstTime && renderFirstTimeView()}
      {!isFirstTime && renderStatsView()}
    </div>
  );
}

function getDayEarnings(
  currentYear: number,
  currentMonth: number,
  currentDayOfMonth: number,
  calculatedEarnings?: EarningsAndInfo
): {
  dayEarnings: number;
  dayEarningsInCurrency: number;
  dripValue: number;
  walletActionsForDay: [string, string][];
} {
  return Object.entries(calculatedEarnings?.walletEarnings ?? {}).reduce(
    (accum, [walletId, walletEarnings]) => {
      const currentDayEarnings =
        walletEarnings.yearEarnings?.[currentYear]?.monthEarnings?.[
          currentMonth
        ]?.dayEarnings?.[currentDayOfMonth];

      if (currentDayEarnings) {
        return {
          dayEarnings: accum.dayEarnings + currentDayEarnings.earnings,
          dayEarningsInCurrency:
            accum.dayEarningsInCurrency + currentDayEarnings.earningsInCurrency,
          dripValue: currentDayEarnings.dripValueOnDay,
          walletActionsForDay: [
            ...accum.walletActionsForDay,
            [walletId, selectActionForDay(currentDayEarnings)],
          ],
        };
      }
      return accum;
    },
    {
      dayEarnings: 0,
      dayEarningsInCurrency: 0,
      dripValue: 0,
      walletActionsForDay: [] as [string, string][],
    }
  );
}

function getGardenDayEarnings(
  currentYear: number,
  currentMonth: number,
  currentDayOfMonth: number,
  calculatedEarnings?: EarningsAndInfo
): {
  gardenDayEarnings: number;
  gardenDayEarningsInCurrency: number;
  dripBUSDLPValue: number;
  walletActionsForDay: [string, GardenDayAction[]][];
} {
  return Object.entries(
    calculatedEarnings?.gardenEarnings?.walletEarnings ?? {}
  ).reduce(
    (accum, [walletId, walletEarnings]) => {
      const currentDayEarnings =
        walletEarnings.yearEarnings?.[currentYear]?.monthEarnings?.[
          currentMonth
        ]?.dayEarnings?.[currentDayOfMonth];

      if (currentDayEarnings) {
        return {
          gardenDayEarnings:
            accum.gardenDayEarnings + currentDayEarnings.earningsInDripBUSDLP,
          gardenDayEarningsInCurrency:
            accum.gardenDayEarningsInCurrency +
            currentDayEarnings.earningsInCurrency,
          dripBUSDLPValue: currentDayEarnings.dripBUSDLPValueOnDay,
          walletActionsForDay: [
            ...accum.walletActionsForDay,
            [walletId, currentDayEarnings?.sowHarvestSchedule ?? []],
          ],
        };
      }
      return accum;
    },
    {
      gardenDayEarnings: 0,
      gardenDayEarningsInCurrency: 0,
      dripBUSDLPValue: 0,
      walletActionsForDay: [] as [string, GardenDayAction[]][],
    }
  );
}

function selectActionForDay(dayEarnings?: DayEarnings): string {
  if (!dayEarnings) {
    return "Unknown";
  }

  if (dayEarnings.isHydrateDay) {
    return "Hydrate";
  }

  if (dayEarnings.isClaimDay) {
    return "Claim";
  }

  return "Leave to Accumulate in Available Rewards";
}

const actionLabels = {
  sow: "Sow",
  harvest: "Harvest",
};

export default Dashboard;
