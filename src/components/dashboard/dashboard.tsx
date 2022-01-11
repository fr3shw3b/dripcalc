import { Button, Tab, Tabs, Drawer } from "@blueprintjs/core";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
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
  const { showTabView, isSettingsOpen } = useSelector(
    (state: AppState) => state.views
  );

  const handleTabChange = (newTabId: string) => {
    dispatch(newTabId === "wallets" ? showWallets() : showOverview());
  };

  const handleSettingsButtonClick: React.MouseEventHandler = (evt) => {
    evt.preventDefault();
    dispatch(showSettingsPanel());
  };

  const handleClose = (evt: React.SyntheticEvent) => {
    evt.preventDefault();
    dispatch(hideSettingsPanel());
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
    </div>
  );
}

export default Dashboard;
