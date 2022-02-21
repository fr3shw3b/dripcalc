import { Card, Elevation } from "@blueprintjs/core";
import moment from "moment";
import { useContext } from "react";
import { useSelector } from "react-redux";

import ContentContext from "../../contexts/content";
import { AppState } from "../../store/types";
import formatCurrency from "../../utils/currency";
import Help from "../help";

import "./garden-overview.css";

function GardenOverview() {
  const { gardenOverview: overviewContent } = useContext(ContentContext);

  const { calculatedEarnings, currency, lastYearInGarden } = useSelector(
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
        lastYearInGarden: state.settings[currentPlanId].gardenLastYear,
      };
    }
  );
  const finalYearFormatted = moment(
    `31/12/${lastYearInGarden}`,
    "DD/MM/YYYYY"
  ).format("MMMM YYYY");

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
          {Intl.NumberFormat("en-US", {
            notation: "compact",
            maximumFractionDigits: 4,
          }).format(
            calculatedEarnings?.gardenEarnings?.info
              .totalHarvestedRewardsInDripBUSDLP ?? 0
          )}
        </p>
        <Help
          helpContent={
            <div className="garden-overview-info">
              {" "}
              {overviewContent.totalRewardsHarvestedInCurrencyHelpText(
                currency
              )}
            </div>
          }
        >
          <span>
            {formatCurrency(
              currency,
              calculatedEarnings?.gardenEarnings?.info
                .totalHarvestedRewardsInCurrency
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
          {Intl.NumberFormat("en-US", {
            notation: "compact",
            maximumFractionDigits: 1,
          }).format(
            calculatedEarnings?.gardenEarnings?.info.totalPlantsBalanceByEnd ??
              0
          )}
        </p>
      </Card>
    </div>
  );
}

export default GardenOverview;
