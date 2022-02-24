import { Card, Elevation } from "@blueprintjs/core";
import moment from "moment";
import { useContext } from "react";
import { useSelector } from "react-redux";

import ContentContext from "../../contexts/content";
import FeatureTogglesContext from "../../contexts/feature-toggles";
import { AppState } from "../../store/types";
import formatCurrency from "../../utils/currency";
import { findLastYearForWallet } from "../../utils/wallets";
import Help from "../help";

import "./overview.css";

function Overview() {
  const { overview: overviewContent } = useContext(ContentContext);

  const {
    calculatedEarnings,
    wallets,
    currency,
    fiatMode: fiatModeInState,
  } = useSelector((state: AppState) => {
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
  });
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

  const featureToggles = useContext(FeatureTogglesContext);

  const fiatMode =
    (featureToggles.dripFiatModeToggle && fiatModeInState) ||
    !featureToggles.dripFiatModeToggle;

  return (
    <div className="overview-container">
      <Card
        className="overview-card"
        interactive={false}
        elevation={Elevation.TWO}
      >
        <Help
          helpContent={
            <div className="overview-info">
              {overviewContent.totalRewardsConsumedHelpText}
            </div>
          }
        >
          <h3>
            {overviewContent.totalRewardsConsumedPrefixText}
            {finalYearFormatted}
          </h3>
        </Help>
        <p>
          <strong>DRIP: </strong>
          {calculatedEarnings?.info.totalConsumedRewards.toFixed(4)}
        </p>
      </Card>
      <Card
        className="overview-card"
        interactive={false}
        elevation={Elevation.TWO}
      >
        <Help
          helpContent={
            <div className="overview-info">
              {overviewContent.totalClaimedHelpText}
            </div>
          }
        >
          <h3>
            {overviewContent.totalClaimedPrefixText}
            {finalYearFormatted}
          </h3>
        </Help>
        <p>
          <strong>DRIP: </strong>
          {calculatedEarnings?.info.totalClaimed.toFixed(4)}
        </p>
        {fiatMode && (
          <Help
            helpContent={
              <div className="overview-info">
                {overviewContent.totalClaimedInCurrencyHelpText(currency)}
              </div>
            }
          >
            <span>
              {formatCurrency(
                currency,
                calculatedEarnings?.info.totalClaimedInCurrency
              )}
            </span>
          </Help>
        )}
      </Card>
      <Card
        className="overview-card"
        interactive={false}
        elevation={Elevation.TWO}
      >
        <Help
          helpContent={
            <div className="overview-info">
              {overviewContent.netPositiveHelpText}
            </div>
          }
        >
          <h3>{overviewContent.netPositiveText}</h3>
        </Help>
        <p>
          {overviewContent.netPositiveValuePrefixText}
          {netPositiveUpToFormatted}
        </p>
      </Card>
      <Card
        className="overview-card"
        interactive={false}
        elevation={Elevation.TWO}
      >
        <Help
          helpContent={
            <div className="overview-info">
              {overviewContent.maxPayoutClaimedHelpText}
            </div>
          }
        >
          <h3>{overviewContent.maxPayoutClaimedText}</h3>
        </Help>
        <p>
          {(
            (calculatedEarnings?.info.percentageMaxPayoutConsumed ?? 0) * 100
          ).toFixed(4)}
          %
        </p>
      </Card>
      {fiatMode && (
        <Card
          className="overview-card"
          interactive={false}
          elevation={Elevation.TWO}
        >
          <Help
            helpContent={
              <div className="overview-info">
                {overviewContent.depositsOutOfPocketHelpText}
              </div>
            }
          >
            <h3>{overviewContent.depositsOutOfPocketText}</h3>
          </Help>
          <p>
            {formatCurrency(
              currency,
              calculatedEarnings?.info.depositsOutOfPocket
            )}
          </p>
          <Help
            helpContent={
              <div className="overview-info">
                {overviewContent.depositsOutOfPocketDateHelpText}
              </div>
            }
          >
            <span>
              {depositsOutOfPocketCoveredByFormatted !== "Not Covered" &&
                overviewContent.depositsOutOfPocketValuePrefixText}
              {depositsOutOfPocketCoveredByFormatted}
            </span>
          </Help>
        </Card>
      )}
    </div>
  );
}

export default Overview;
