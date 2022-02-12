import {
  Button,
  Tab,
  Tabs,
  Drawer,
  DrawerSize,
  Position,
} from "@blueprintjs/core";
import { Tooltip2 } from "@blueprintjs/popover2";
import { useDispatch, useSelector } from "react-redux";
import useMobileCheck from "../../hooks/use-mobile-check";

import { setNotFirstTime } from "../../store/actions/general";
import {
  hideSettingsPanel,
  showGardenOverview,
  showGardenPlan,
  showSettingsPanel,
  showWallets,
} from "../../store/actions/views";
import { ShowGardenTabView } from "../../store/reducers/views";
import { AppState } from "../../store/types";
import GardenOverview from "../garden-overview";
import GardenSettings from "../garden-settings";
import Wallets from "../wallets";

import "./garden-dashboard.css";

const tabs = {
  [ShowGardenTabView.Overview]: "garden-overview",
  [ShowGardenTabView.Plan]: "garden-plan",
};

function Garden() {
  const isMobile = useMobileCheck();
  const dispatch = useDispatch();
  const { isFirstTime, showGardenTabView, isSettingsOpen, currentPlanId } =
    useSelector((state: AppState) => {
      const currentPlan = state.plans.current;
      return {
        ...state.views[currentPlan],
        isFirstTime: state.general.isFirstTime,
        currentPlanId: currentPlan,
      };
    });

  const handleTabChange = (newTabId: string) => {
    dispatch(
      newTabId === "garden-plan"
        ? showGardenPlan(currentPlanId)
        : showGardenOverview(currentPlanId)
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
    <div
      className={`garden-dashboard ${
        showGardenTabView === ShowGardenTabView.Overview ? "overview" : "plan"
      }`}
    >
      <Drawer
        className="bp3-dark"
        icon="settings"
        onClose={handleClose}
        title="Garden Settings"
        isOpen={isSettingsOpen}
        size={isMobile ? "100%" : DrawerSize.STANDARD}
        usePortal={false}
      >
        <GardenSettings />
      </Drawer>

      {isFirstTime && (
        <div className="garden-intro">
          <h1>Welcome to the garden calculator!</h1>
          <p>
            This tool is a calculator for your long term DRIP LP garden earnings
            that provides a long-term look at your sowing/harvesting strategy.
          </p>
          <p>
            The dashboard provides two sections. One is the overview tab that
            provides some high level stats that give an overview of your
            earnings in the DRIP LP garden. The other is the "plan &amp;
            earnings" tab where all the action happens, here you can configure
            strategies and see earning results.
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
            id="GardenDashboardTabs"
            onChange={handleTabChange}
            selectedTabId={tabs[showGardenTabView]}
          >
            <Tab
              id="garden-overview"
              title="Overview"
              panel={<GardenOverview />}
            />
            <Tab
              id="garden-plan"
              title="Plan"
              panel={<Wallets forCalculator="garden" />}
            />
          </Tabs>
          <div className="settings-button-wrapper">
            <Tooltip2
              content={`Garden Settings`}
              position={Position.BOTTOM}
              openOnTargetFocus={false}
            >
              <Button
                className="settings-button"
                icon="settings"
                onClick={handleSettingsButtonClick}
              />
            </Tooltip2>
          </div>
        </>
      )}
    </div>
  );
}

export default Garden;
