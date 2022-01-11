import WalletsPanel from "../wallets-panel";
import "./wallets.css";

function Wallets() {
  return (
    <div className="wallets-container">
      <div className="wallet-panel-container">
        <WalletsPanel />
      </div>
    </div>
  );
}

export default Wallets;
