import { Routes, Route, Navigate } from "react-router-dom";

import Header from "../header";
import FaucetDashboard from "../faucet-dashboard";
import Dashboard from "../dashboard";
import FaucetInformation from "../faucet-information";
import { Toast, Toaster } from "@blueprintjs/core";
import { useDispatch, useSelector } from "react-redux";
import { AppState } from "../../store/types";
import { removeNotification, initialiseApp } from "../../store/actions/general";
import { useContext, useEffect } from "react";
import GardenDashboard from "../garden-dashboard";
import GardenInformation from "../garden-information";
import FeatureTogglesContext from "../../contexts/feature-toggles";
import ConfigContext from "../../contexts/config";

function App() {
  const dispatch = useDispatch();
  const featureToggles = useContext(FeatureTogglesContext);
  const appConfig = useContext(ConfigContext);
  const { notifications } = useSelector((state: AppState) => state.general);

  const handleDismiss = (notificationId: string) => () => {
    dispatch(removeNotification(notificationId));
  };

  useEffect(() => {
    if (featureToggles.dripFiatModeToggle) {
      dispatch(initialiseApp(appConfig.priceRefreshInterval));
    }
  }, []);

  return (
    <div className="app bp3-dark">
      <Header />
      <div className="wrapper">
        <Toaster>
          {notifications.map((notification) => {
            return (
              <Toast
                key={notification.id}
                onDismiss={handleDismiss(notification.id)}
                message={notification.message}
                intent={INTENTS[notification.type]}
              />
            );
          })}
        </Toaster>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route
            path="/faucet"
            element={<Navigate replace to="/faucet/dashboard" />}
          />
          <Route path="/faucet/dashboard" element={<FaucetDashboard />} />
          <Route path="/faucet/information" element={<FaucetInformation />} />
          {featureToggles.gardenCalculator && (
            <>
              <Route
                path="/drip-garden"
                element={<Navigate replace to="/drip-garden/dashboard" />}
              />
              <Route
                path="/drip-garden/dashboard"
                element={<GardenDashboard />}
              />
              <Route
                path="/drip-garden/information"
                element={<GardenInformation />}
              />
            </>
          )}
        </Routes>
        <div className="push" />
      </div>
      <footer className="footer">
        Developed by fr3shw3b in the{" "}
        <a href="https://t.me/DRIPtoken_Chat" target="_blank" rel="noreferrer">
          DRIP Telegram Group
        </a>
      </footer>
    </div>
  );
}

const INTENTS = {
  error: "danger",
  info: "primary",
  warning: "warning",
} as const;

export default App;
