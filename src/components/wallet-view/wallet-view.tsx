import { Button } from "@blueprintjs/core";
import { MonthInput } from "../../store/reducers/wallets";

import MomentDateRange from "../moment-date-range";

import "./wallet-view.css";

type Props = {
  walletId: string;
  label: string;
  startDate: number;
  monthInputs: Record<string, MonthInput>;
  onEditClick: (walletId: string) => void;
};

function WalletView({
  walletId,
  label,
  startDate,
  monthInputs,
  onEditClick,
}: Props) {
  const handleEditClick: React.MouseEventHandler = (evt) => {
    evt.preventDefault();
    onEditClick(walletId);
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
      </h2>
      <MomentDateRange
        className="date-range"
        range={[new Date(startDate), new Date(startDate)]}
      />
    </>
  );
}

export default WalletView;
