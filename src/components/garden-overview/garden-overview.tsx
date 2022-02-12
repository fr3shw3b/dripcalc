import { Card, Elevation } from "@blueprintjs/core";
import moment from "moment";
import { useContext } from "react";
import { useSelector } from "react-redux";

import ContentContext from "../../contexts/content";
import { AppState } from "../../store/types";
import formatCurrency from "../../utils/currency";
import { findLastYearForWallet } from "../../utils/wallets";
import Help from "../help";

import "./garden-overview.css";

function GardenOverview() {
  const { gardenOverview: overviewContent } = useContext(ContentContext);

  const { calculatedEarnings, wallets, currency } = useSelector(
    (state: AppState) => {
      const currentPlanId = state.plans.current;
      const currentPlan = state.plans.plans.find(
        (plan) => plan.id === currentPlanId
      );
      return {
        ...state.general,
        calculatedEarnings: state.general.calculatedEarnings[currentPlanId],
        currency: state.settings[currentPlanId].currency,
        wallets: currentPlan?.wallets ?? [],
      };
    }
  );
  const lastWalletYears = wallets.map(
    (wallet) => findLastYearForWallet(wallet.id, calculatedEarnings) ?? 0
  );
  lastWalletYears.sort((a, b) => a - b);
  const finalYear = lastWalletYears[lastWalletYears.length - 1];
  const finalYearFormatted = moment(new Date(finalYear)).format("MMMM YYYY");
  const netPositiveUpToFormatted = moment(
    new Date(calculatedEarnings?.info.netPositiveUpToDate as number)
  ).format("MMMM YYYY");
  const depositsOutOfPocketCoveredByFormatted =
    (calculatedEarnings?.info.depositsOutOfPocketCoveredBy ?? 0) > 0
      ? moment(
          new Date(
            calculatedEarnings?.info.depositsOutOfPocketCoveredBy as number
          )
        ).format("MMMM YYYY")
      : "Not Covered";

  return (
    <div className="garden-overview-container">
      <Card
        className="garden-overview-card"
        interactive={false}
        elevation={Elevation.TWO}
      >
        <Help
          helpContent={
            <div className="garden-overview-info">
              {overviewContent.totalRewardsHarvestedHelpText(currency)}
            </div>
          }
        >
          <h3>
            {overviewContent.totalRewardsHarvestedPrefixText}
            {finalYearFormatted}
          </h3>
        </Help>
        <p>
          <strong>DRIP/BUSD LP: </strong>
          {calculatedEarnings?.info.totalClaimed.toFixed(4)}
        </p>
        <Help helpContent={<div className="garden-overview-info"></div>}>
          <span>
            {formatCurrency(
              currency,
              calculatedEarnings?.info.totalClaimedInCurrency
            )}
          </span>
        </Help>
      </Card>
      <Card
        className="garden-overview-card"
        interactive={false}
        elevation={Elevation.TWO}
      >
        <Help
          helpContent={
            <div className="garden-overview-info">
              {overviewContent.totalPlantsHelpText}
            </div>
          }
        >
          <h3>
            {overviewContent.totalPlantsPrefixText}
            {finalYearFormatted}
          </h3>
        </Help>
        <p>
          <strong>Plants: </strong>
          {calculatedEarnings?.info.totalClaimed.toFixed(4)}
        </p>
      </Card>
    </div>
  );
}

export default GardenOverview;
