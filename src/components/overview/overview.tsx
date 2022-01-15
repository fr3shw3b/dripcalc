import { Card, Elevation } from "@blueprintjs/core";
import { useSelector } from "react-redux";
import { AppState } from "../../store/types";
import Help from "../help";

import "./overview.css";

function Overview() {
  const { currency } = useSelector((state: AppState) => state.settings);
  return (
    <div className="overview-container">
      <Card
        className="overview-card"
        interactive={false}
        elevation={Elevation.TWO}
      >
        <Help helpContent={<>Content</>}>
          <h3>Total Rewards Consumed by December 2028</h3>
        </Help>
        <p>
          <strong>DRIP: </strong>
          placeholder
        </p>
        <Help helpContent={<>Content</>}>
          <span>{currency}placeholder</span>
        </Help>
      </Card>
      <Card
        className="overview-card"
        interactive={false}
        elevation={Elevation.TWO}
      >
        <Help helpContent={<>Content</>}>
          <h3>Total Claimed by December 2028</h3>
        </Help>
        <p>
          <strong>DRIP: </strong>
          placeholder
        </p>
        <Help helpContent={<>Content</>}>
          <span>{currency}placeholder</span>
        </Help>
      </Card>
      <Card
        className="overview-card"
        interactive={false}
        elevation={Elevation.TWO}
      >
        <Help helpContent={<>Content</>}>
          <h3>Net Positive</h3>
        </Help>
        <p>Up to December 2025</p>
      </Card>
      <Card
        className="overview-card"
        interactive={false}
        elevation={Elevation.TWO}
      >
        <Help helpContent={<>Content</>}>
          <h3>% Max Payout Claimed</h3>
        </Help>
        <p>70%</p>
      </Card>
      <Card
        className="overview-card"
        interactive={false}
        elevation={Elevation.TWO}
      >
        <Help helpContent={<>Content</>}>
          <h3>Deposits out of Pocket</h3>
        </Help>
        <p>{currency}placeholder</p>
        <Help helpContent={<>Content</>}>
          <span>Covered by December 2025</span>
        </Help>
      </Card>
    </div>
  );
}

export default Overview;
