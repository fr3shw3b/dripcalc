import { useContext } from "react";
import { Button, Tab, Tabs } from "@blueprintjs/core";

import { MonthInput } from "../../store/reducers/plans";
import ContentContext from "../../contexts/content";
import MomentDateRange from "../moment-date-range";

import "./wallet-view.css";
import { useSelector } from "react-redux";
import { AppState } from "../../store/types";

import MonthlyWalletPanel from "../monthly-wallet-panel";
import YearlyWalletPanel from "../yearly-wallet-panel";
import { Popover2 } from "@blueprintjs/popover2";
import { findLastYearForWallet } from "../../utils/wallets";

type Props = {
  walletId: string;
  label: string;
  startDate: number;
  monthInputs: Record<string, MonthInput>;
  onEditClick: (walletId: string) => void;
  onDepositsClick: (walletId: string) => void;
  onReinvestmentPlanClick: (walletId: string) => void;
  onCustomDripValuesClick: (walletId: string) => void;
};

function WalletView({
  walletId,
  label,
  startDate,
  monthInputs,
  onEditClick,
  onDepositsClick,
  onReinvestmentPlanClick,
  onCustomDripValuesClick,
}: Props) {
  const { wallets: walletsContent } = useContext(ContentContext);
  const { isCalculating, calculatedEarnings, currentPlanId } = useSelector(
    (state: AppState) => ({
      ...state.general,
      currentPlanId: state.plans.current,
    })
  );

  const handleEditClick: React.MouseEventHandler = (evt) => {
    evt.preventDefault();
    onEditClick(walletId);
  };

  const handleDepositsClick: React.MouseEventHandler = (evt) => {
    evt.preventDefault();
    onDepositsClick(walletId);
  };

  const handleReinvestmentPlanClick: React.MouseEventHandler = (evt) => {
    evt.preventDefault();
    onReinvestmentPlanClick(walletId);
  };

  const handleCustomDripValuesClick: React.MouseEventHandler = (evt) => {
    evt.preventDefault();
    onCustomDripValuesClick(walletId);
  };

  return (
    <div className="wallet-view-container">
      <h2 className="wallet-heading">
        {label}{" "}
        <Button
          className="wallet-heading-cta"
          icon="edit"
          small
          onClick={handleEditClick}
        />
        <Button
          className="wallet-heading-cta"
          icon="bank-account"
          small
          onClick={handleDepositsClick}
          text={walletsContent.depositsButtonText}
        />
        <Button
          className="wallet-heading-cta"
          icon="percentage"
          small
          onClick={handleReinvestmentPlanClick}
          text={walletsContent.reinvestButtonText}
        />
        <Button
          className="wallet-heading-cta"
          icon="tint"
          small
          onClick={handleCustomDripValuesClick}
          text={walletsContent.customDripValuesButtonText}
        />
      </h2>
      <div className="wallet-help">
        <Popover2
          content={
            <div className="wallet-help-popover-content">
              {walletsContent.walletViewHelpText}
            </div>
          }
          placement="left"
          usePortal={false}
          modifiers={{
            arrow: { enabled: true },
            flip: { enabled: true },
            preventOverflow: { enabled: true },
          }}
        >
          <Button icon="help" />
        </Popover2>
      </div>
      <div>
        <MomentDateRange
          className={`date-range${isCalculating ? " bp3-skeleton" : ""}`}
          range={[
            new Date(startDate),
            new Date(
              findLastYearForWallet(
                walletId,
                calculatedEarnings[currentPlanId]
              ) ?? startDate
            ),
          ]}
        />
        <div className="block">
          <Tabs
            id={`wallet-${walletId}-tabs`}
            className={isCalculating ? "bp3-skeleton" : ""}
          >
            <Tab
              id={`monthly-${walletId}`}
              title="Monthly"
              panel={<MonthlyWalletPanel walletId={walletId} />}
            />
            <Tab
              id={`yearly-${walletId}`}
              title="Yearly"
              panel={<YearlyWalletPanel walletId={walletId} />}
            />
          </Tabs>
        </div>
      </div>
    </div>
  );
}

export default WalletView;
