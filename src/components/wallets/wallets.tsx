import FaucetWalletsPanel from "../faucet-wallets-panel";
import GardenWalletsPanel from "../garden-wallets-panel";

import "./wallets.css";

type Props = {
  forCalculator: "garden" | "faucet";
};

function Wallets({ forCalculator }: Props) {
  return (
    <div className="wallets-container">
      <div className="wallet-panel-container">
        {forCalculator === "faucet" && <FaucetWalletsPanel />}
        {forCalculator === "garden" && <GardenWalletsPanel />}
      </div>
    </div>
  );
}

export default Wallets;
