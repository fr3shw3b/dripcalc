import { Button } from "@blueprintjs/core";
import { useContext } from "react";
import { MonthInput } from "../../store/reducers/wallets";

import ContentContext from "../../contexts/content";
import MomentDateRange from "../moment-date-range";

import "./wallet-view.css";

type Props = {
  walletId: string;
  label: string;
  startDate: number;
  monthInputs: Record<string, MonthInput>;
  onEditClick: (walletId: string) => void;
  onDepositsClick: (walletId: string) => void;
  onReinvestmentPlanClick: (walletId: string) => void;
};

function WalletView({
  walletId,
  label,
  startDate,
  monthInputs,
  onEditClick,
  onDepositsClick,
  onReinvestmentPlanClick,
}: Props) {
  const { wallets: walletsContent } = useContext(ContentContext);

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

  return (
    <>
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
      </h2>
      <MomentDateRange
        className="date-range"
        range={[new Date(startDate), new Date(startDate)]}
      />
    </>
  );
}

export default WalletView;
