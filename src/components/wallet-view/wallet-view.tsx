import { Button } from "@blueprintjs/core";
import { useContext } from "react";

import { MonthInput } from "../../store/reducers/wallets";
import ContentContext from "../../contexts/content";
import MomentDateRange from "../moment-date-range";

import "./wallet-view.css";
import { useSelector } from "react-redux";
import { AppState } from "../../store/types";
import { EarningsAndInfo } from "../../store/middleware/shared-calculator-types";
import moment from "moment";
import { getDaysInMonth } from "../../utils/date";

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
  const { calculatedEarnings } = useSelector(
    (state: AppState) => state.general
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
        <Button
          className="wallet-heading-cta"
          icon="tint"
          small
          onClick={handleCustomDripValuesClick}
          text={walletsContent.customDripValuesButtonText}
        />
      </h2>
      <MomentDateRange
        className="date-range"
        range={[
          new Date(startDate),
          new Date(
            findLastYearForWallet(walletId, calculatedEarnings) ?? startDate
          ),
        ]}
      />
    </>
  );
}

function findLastYearForWallet(
  walletId: string,
  calculatedEarnings?: EarningsAndInfo
): number | undefined {
  if (!calculatedEarnings) {
    return undefined;
  }

  const { yearEarnings: yearEarningsMap } =
    calculatedEarnings.walletEarnings[walletId];

  const lastYearEarnings = Object.values(yearEarningsMap).find(
    (yearEarnings) => yearEarnings.lastYear
  );

  if (!lastYearEarnings) {
    return undefined;
  }

  const monthKeys = Object.keys(lastYearEarnings.monthEarnings);
  monthKeys.sort();

  const month = monthKeys[monthKeys.length - 1];
  const daysInMonth = getDaysInMonth(
    moment(`1/${month}/${lastYearEarnings.year}`, "D/M/YYYY").toDate()
  );
  return Number.parseInt(
    moment(
      `${daysInMonth}/${month}/${lastYearEarnings.year}`,
      "D/M/YYYY"
    ).format("x"),
    10
  );
}

export default WalletView;
