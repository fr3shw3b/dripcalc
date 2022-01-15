import { Routes, Route } from "react-router-dom";

import Header from "../header";
import Dashboard from "../dashboard";
import Information from "../information";
import { Toast, Toaster } from "@blueprintjs/core";
import { useDispatch, useSelector } from "react-redux";
import { AppState } from "../../store/types";
import { removeNotification } from "../../store/actions/general";

function App() {
  const dispatch = useDispatch();
  const { notifications } = useSelector((state: AppState) => state.general);

  const handleDismiss = (notificationId: string) => () => {
    dispatch(removeNotification(notificationId));
  };

  return (
    <div className="app bp3-dark">
      <Header />
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
        <Route path="information" element={<Information />} />
      </Routes>
    </div>
  );
}

const INTENTS = {
  error: "danger",
  info: "primary",
  warning: "warning",
} as const;

export default App;
