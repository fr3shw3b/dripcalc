import { Routes, Route, Navigate } from "react-router-dom";

import Header from "../header";
import FaucetDashboard from "../faucet-dashboard";
import Dashboard from "../dashboard";
import FaucetInformation from "../faucet-information";
import { Toast, Toaster } from "@blueprintjs/core";
import { useDispatch, useSelector } from "react-redux";
import { AppState } from "../../store/types";
import { removeNotification } from "../../store/actions/general";
// import GardenDashboard from "../garden-dashboard";

function App() {
  const dispatch = useDispatch();
  const { notifications } = useSelector((state: AppState) => state.general);

  const handleDismiss = (notificationId: string) => () => {
    dispatch(removeNotification(notificationId));
  };

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
          {/* <Route
            path="/drip-garden"
            element={<Navigate replace to="/drip-garden/dashboard" />}
          />
          <Route path="/drip-garden/dashboard" element={<GardenDashboard />} /> */}
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
