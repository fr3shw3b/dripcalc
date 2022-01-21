import { Button, Tab, Tabs, Drawer } from "@blueprintjs/core";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { setNotFirstTime } from "../../store/actions/general";
import {
  hideSettingsPanel,
  showOverview,
  showSettingsPanel,
  showWallets,
} from "../../store/actions/views";
import { ShowTabView } from "../../store/reducers/views";
import { AppState } from "../../store/types";
import Overview from "../overview";
import Settings from "../settings";
import Wallets from "../wallets";

import "./dashboard.css";

const tabs = {
  [ShowTabView.Overview]: "overview",
  [ShowTabView.Wallets]: "wallets",
};

function Dashboard() {
  const dispatch = useDispatch();
  const { isFirstTime, showTabView, isSettingsOpen, currentPlanId } =
    useSelector((state: AppState) => {
      const currentPlanId = state.plans.current;
      return {
        ...state.views[currentPlanId],
        isFirstTime: state.general.isFirstTime,
        currentPlanId,
      };
    });

  const handleTabChange = (newTabId: string) => {
    dispatch(
      newTabId === "wallets"
        ? showWallets(currentPlanId)
        : showOverview(currentPlanId)
    );
  };

  const handleSettingsButtonClick: React.MouseEventHandler = (evt) => {
    evt.preventDefault();
    dispatch(showSettingsPanel(currentPlanId));
  };

  const handleGetStartedClick: React.MouseEventHandler = (evt) => {
    evt.preventDefault();
    // Default to the wallets view for first time users!
    dispatch(showWallets(currentPlanId));
    dispatch(setNotFirstTime());
  };

  const handleClose = (evt: React.SyntheticEvent) => {
    evt.preventDefault();
    dispatch(hideSettingsPanel(currentPlanId));
  };

  return (
    <div className="dashboard">
      <Drawer
        className="bp3-dark"
        icon="settings"
        onClose={handleClose}
        title="Settings"
        isOpen={isSettingsOpen}
        usePortal={false}
      >
        <Settings />
      </Drawer>

      {isFirstTime && (
        <div className="intro">
          <h1>Welcome to dripcalc!</h1>
          <p>
            This tool is a calculator for your long term DRIP earnings that
            provides a long-term look across multiple wallets for your DRIP
            faucet compounding strategy.
          </p>
          <p>
            The tool dashboard provides two tabs. One is the overview tab that
            provides some high level stats that give an overview of your
            earnings across all wallets along with some other useful
            DRIP-specific insights. The other is the wallets tab where all the
            action happens, here you can configure strategies and see earning
            results across multiple wallets.
          </p>
          <p>
            You will find tooltips and help buttons across components in the
            dashboard to help give that extra bit of help in understanding the
            data.
          </p>
          <p>
            All your changes will be saved to your browser's storage for future
            sessions in the same browser.
          </p>
          <Button
            className="block"
            intent="primary"
            icon="chevron-right"
            text="Get started"
            onClick={handleGetStartedClick}
          />
        </div>
      )}
      {!isFirstTime && (
        <>
          {" "}
          <Tabs
            id="DashboardTabs"
            onChange={handleTabChange}
            selectedTabId={tabs[showTabView]}
          >
            <Tab id="overview" title="Overview" panel={<Overview />} />
            <Tab id="wallets" title="Wallets" panel={<Wallets />} />
          </Tabs>
          <Button
            className="settings-button"
            icon="settings"
            onClick={handleSettingsButtonClick}
          />
        </>
      )}
    </div>
  );
}

export default Dashboard;
